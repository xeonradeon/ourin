const config = require('../../config')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'tqto',
    alias: ['thanksto', 'credits', 'kredit'],
    category: 'main',
    description: 'Menampilkan daftar kontributor bot',
    usage: '.tqto',
    example: '.tqto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = config.bot?.name || 'Ourin-AI'
    const version = config.bot?.version || '1.0.0'
    const developer = config.bot?.developer || 'Lucky Archz'
    
    const credits = [
        { name: 'hyuuSATAN', role: 'Owner', icon: '👨‍💻' },
        { name: 'Keisya', role: 'Owner', icon: '👩‍💻' },
        { name: 'Lucky Archz', role: 'Developer', icon: '👨‍💻' },
        { name: 'Danzzz', role: 'Designer', icon: '👨‍💻' },
        { name: 'Wileys', role: 'Penyedia Baileys', icon: '📚' },
        { name: 'Open Source Community', role: 'Libraries & Tools', icon: '🌐' }
    ]
    
    const specialThanks = [
        'Semua tester dan bug reporter',
        'User yang memberikan feedback',
        'Komunitas WhatsApp Bot Indonesia'
    ]
    
    let txt = `✨ *ᴛʜᴀɴᴋs ᴛᴏ*\n\n`
    txt += `> Terima kasih kepada semua yang berkontribusi!\n\n`
    
    txt += `╭─「 👥 *ᴄᴏɴᴛʀɪʙᴜᴛᴏʀs* 」\n`
    credits.forEach((c, i) => {
        txt += `┃ ${c.icon} \`${c.name}\`\n`
        txt += `┃    └ *${c.role}*\n`
        if (i < credits.length - 1) txt += `┃\n`
    })
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 💖 *sᴘᴇᴄɪᴀʟ ᴛʜᴀɴᴋs* 」\n`
    specialThanks.forEach((t, i) => {
        txt += `┃ ⭐ ${t}\n`
    })
    txt += `╰───────────────\n\n`
    
    txt += `╭─「 📋 *ɪɴꜰᴏ ʙᴏᴛ* 」\n`
    txt += `┃ 🤖 \`ɴᴀᴍᴀ\`: *${botName}*\n`
    txt += `┃ 📦 \`ᴠᴇʀsɪ\`: *${version}*\n`
    txt += `┃ 👨‍💻 \`ᴅᴇᴠ\`: *${developer}*\n`
    txt += `╰───────────────\n\n`
    
    txt += `> Made with ❤️ by the team`
    
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || botName
    const saluranLink = config.saluran?.link || ''
    
    let thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')
    let thumbBuffer = null
    if (fs.existsSync(thumbPath)) {
        thumbBuffer = fs.readFileSync(thumbPath)
    }
    
    const contextInfo = {
        mentionedJid: [],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        },
        externalAdReply: {
            title: `✨ Thanks To - ${botName}`,
            body: `v${version} • Credits & Contributors`,
            sourceUrl: saluranLink,
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail: true
        }
    }
    
    if (thumbBuffer) {
        contextInfo.externalAdReply.thumbnail = thumbBuffer
    }
    
    const fakeQuoted = {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            extendedTextMessage: {
                text: `✨ ${botName} Credits`,
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                        serverMessageId: 127
                    }
                }
            }
        }
    }
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: contextInfo
    }, { quoted: fakeQuoted })
}

module.exports = {
    config: pluginConfig,
    handler
}
