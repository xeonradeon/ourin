const { spawn } = require('child_process')
const config = require('../../config')
const path = require('path')
const fs = require('fs')

const pluginConfig = {
    name: 'nulis',
    alias: ['tulis', 'write'],
    category: 'tools',
    description: 'Generate tulisan tangan di kertas',
    usage: '.nulis <teks>',
    example: '.nulis Aku cinta kamu selamanya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    limit: 1,
    isEnabled: true
}

let thumbTools = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-games.jpg')
    if (fs.existsSync(thumbPath)) thumbTools = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '📝 *ɴᴜʟɪs*', body = 'Tulisan tangan') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'
    
    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }
    
    if (thumbTools) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbTools,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: config.saluran?.link || ''
        }
    }
    
    return contextInfo
}

async function handler(m, { sock }) {
    const text = m.args?.join(' ')
    
    if (!text) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}nulis <teks>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}nulis Aku cinta kamu selamanya\``
        )
    }
    
    if (text.length > 500) {
        return m.reply(`❌ *ᴛᴇᴋs ᴛᴇʀʟᴀʟᴜ ᴘᴀɴᴊᴀɴɢ*\n\n> Maksimal 500 karakter`)
    }
    
    const fontPath = path.join(process.cwd(), 'assets', 'fonts', 'Zahraaa.ttf')
    const inputPath = path.join(process.cwd(), 'assets', 'kertas', 'magernulis1.jpg')
    
    if (!fs.existsSync(fontPath)) {
        return m.reply(`❌ *ғᴏɴᴛ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\n> File \`assets/fonts/Zahraaa.ttf\` tidak ditemukan`)
    }
    
    if (!fs.existsSync(inputPath)) {
        return m.reply(`❌ *ᴛᴇᴍᴘʟᴀᴛᴇ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\n> File \`assets/kertas/magernulis1.jpg\` tidak ditemukan`)
    }
    
    await m.react('⏳')
    await m.reply(`⏳ *ᴍᴇᴍᴘʀᴏsᴇs...*\n\n> Membuat tulisan tangan...`)
    
    const d = new Date()
    const tgl = d.toLocaleDateString('id-ID')
    const hari = d.toLocaleDateString('id-ID', { weekday: 'long' })
    
    const bufs = []
    
    const spawnArgs = [
        'convert',
        inputPath,
        '-font', fontPath,
        '-size', '1024x784',
        '-pointsize', '20',
        '-interline-spacing', '1',
        '-annotate', '+806+78', hari,
        '-font', fontPath,
        '-size', '1024x784',
        '-pointsize', '18',
        '-interline-spacing', '1',
        '-annotate', '+806+102', tgl,
        '-font', fontPath,
        '-size', '1024x784',
        '-pointsize', '20',
        '-interline-spacing', '-7.5',
        '-annotate', '+344+142', text,
        'jpg:-'
    ]
    
    return new Promise((resolve, reject) => {
        const process = spawn('convert', spawnArgs)
        
        process.stdout.on('data', chunk => bufs.push(chunk))
        
        process.on('error', async (e) => {
            await m.react('❌')
            await m.reply(`❌ *ɪᴍᴀɢᴇᴍᴀɢɪᴄᴋ ᴛɪᴅᴀᴋ ᴀᴅᴀ*\n\n> Install dengan: \`sudo apt install imagemagick\``)
            reject(e)
        })
        
        process.on('close', async (code) => {
            if (code !== 0 || bufs.length === 0) {
                await m.react('❌')
                await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Gagal generate tulisan`)
                return reject(new Error('Process failed'))
            }
            
            await m.react('✅')
            await sock.sendMessage(m.chat, {
                image: Buffer.concat(bufs),
                caption: `✅ *ᴛᴜʟɪsᴀɴ ᴛᴀɴɢᴀɴ*\n\n> Hatihati ketahuan! 📖`,
                contextInfo: getContextInfo()
            }, { quoted: m })
            
            resolve()
        })
    }).catch(() => {})
}

module.exports = {
    config: pluginConfig,
    handler
}
