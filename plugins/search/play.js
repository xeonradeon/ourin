const yts = require('yt-search')
const SaveTubeClient = require('../../src/scraper/youtube')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const { config } = require('../../config')
const execAsync = promisify(exec)

const pluginConfig = {
    name: 'play',
    alias: ['p', 'playvn'],
    category: 'search',
    description: 'Putar musik dari YouTube',
    usage: '.play <query>',
    example: '.play neffex grateful',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 20,
    limit: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()
    
    if (!query) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}play <query>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}play neffex grateful\``
        )
    }

    m.react("🎧")
    
    try {
        const search = await yts(query)
        const video = search.videos[0]
        
        if (!video) {
            return m.reply(`❌ Tidak ditemukan hasil untuk: ${query}`)
        }
        
        const api = new SaveTubeClient()
        const info = await api.getVideoInfo(video.url)
        
        if (info.error || !info.key) {
            return m.reply(`❌ Gagal mengambil info video.`)
        }
        
        const download = await api.getDownload(info.key, 'audio', 128)
        
        if (!download?.downloadUrl) {
            return m.reply(`❌ Gagal mendapatkan link download.`)
        }
        
        const tempDir = path.join(process.cwd(), 'temp')
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true })
        }
        
        const tempMp3 = path.join(tempDir, `play_${Date.now()}.mp3`)

        const mp3Res = await require('axios').get(download.downloadUrl, { responseType: 'arraybuffer' })
        fs.writeFileSync(tempMp3, Buffer.from(mp3Res.data))
        
        const audioBuffer = fs.readFileSync(tempMp3)
        
        await sock.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            fileLength: 99999999,
            fileSize: 99999999,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config?.saluran?.id,
                    newsletterName: config?.saluran?.name,
                },
                externalAdReply: {
                    title: video.title,
                    body: `Jangan lupa follow Saluran Ourin yak 3> `,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaUrl: video.url,
                    mediaType: 2,
                    renderLargerThumbnail: true,
                    
                }
            }
        }, { quoted: m })
        
        fs.unlinkSync(tempMp3)
        
    } catch (err) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
