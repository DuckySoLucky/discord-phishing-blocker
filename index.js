const { MessageEmbed, Client, Intents } = require('discord.js');
const https = require('https');
const fs = require('fs')
const client = new Client({intents: new Intents(32767)})
const config = require('./config.json');

client.once('ready', () => {
    console.log('Client ready, logged in as ' + client.user.tag);
    blacklistUpdate();
})

async function blacklistUpdate(){
    let url = 'https://raw.githubusercontent.com/DuckySoLucky/discord-phishing-links/main/links.txt'
    https.get(url, (res) => {
        let data = "";
        res.on('data', data_chunk => {
            data += data_chunk;
        })
        res.on('end', async () => {
            let blacklistedWord = data.split("\n").filter(e=>e)
            fs.writeFile('blacklist.json', JSON.stringify(blacklistedWord), (err) => {
                if (err) return console.error(err)
            })
        })
    })
}

client.on('message', async (message) => {
    if (message.author.id != client.user.id && message.author.bot != true) {
        const blacklisted = require('./blacklist.json')
        let found = false
        let desc = `**User:** <@${message.author.id}>\n**User ID:** ${message.author.id}\n**Message:** \`\`${message.content}\`\`\n**Blacklisted:** `
        for (let i = 0; i < blacklisted.length; i++) {
            if (message.content.includes(blacklisted[i])) {
                desc += `\`\`${blacklisted[i]}\`\` `;
                found = true;
                break;
            }
        }
        if (found == true) {
            if (config.notifyChannel != undefined) {
                let linkEmbed = new MessageEmbed()
                    .setTitle(":warning: Message deleted - Malicious URL")
                    .setDescription(`${desc}`)
                    .setColor('#ff0000')
                    .setFooter({ text: '© Made by DuckySoLucky', iconURL: 'https://cdn.discordapp.com/avatars/486155512568741900/31cabcf3c42823f8d8266fd22babb862.png?size=4096' });
                client.channels.cache.get(config.notifyChannel).send({ embeds: [ linkEmbed ] });
            }
            message.delete()
        }
    }
});

client.login(config.token)