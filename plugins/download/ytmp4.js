const SaveTubeClient = require('../../src/scraper/youtube')

const pluginConfig = {
    name: 'ytmp4',
    alias: ['ytvideo', 'youtubemp4'],
    category: 'download',
    description: 'Download video YouTube MP4',
    usage: '.ytmp4 <url>',
    example: '.ytmp4 https://youtu.be/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    limit: 1,
    isEnabled: true
}

if (!global.ytdlSessions) {
    global.ytdlSessions = new Map()
}

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    
    if (!url) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}ytmp4 <url>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}ytmp4 https://youtu.be/xxx\``
        )
    }
    
    if (!url.match(/youtu\.?be/i)) {
        return m.reply(`❌ URL tidak valid. Gunakan link YouTube.`)
    }
    
    await m.reply(`⏳ *ᴍᴇɴɢᴀᴍʙɪʟ ɪɴꜰᴏ ᴠɪᴅᴇᴏ...*`)
    
    try {
        const api = new SaveTubeClient()
        const info = await api.getVideoInfo(url)
        
        if (info.error || !info.key) {
            return m.reply(`❌ Gagal mengambil info video. Coba link lain.`)
        }
        
        const availableFormats = info.video_formats.filter(f => f.quality && f.quality > 0)
        
        if (availableFormats.length === 0) {
            return m.reply(`❌ Tidak ada format video yang tersedia.`)
        }
        
        const sortedFormats = availableFormats.sort((a, b) => b.quality - a.quality)
        const uniqueFormats = []
        const seenQualities = new Set()
        for (const f of sortedFormats) {
            if (!seenQualities.has(f.quality)) {
                seenQualities.add(f.quality)
                uniqueFormats.push(f)
            }
        }
        
        let txt = `🎬 *ʏᴏᴜᴛᴜʙᴇ ᴍᴘ4 ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n`
        txt += `╭─「 📋 *ɪɴꜰᴏ ᴠɪᴅᴇᴏ* 」\n`
        txt += `┃ 📛 \`ᴛɪᴛʟᴇ\`: *${info.title}*\n`
        txt += `┃ ⏱️ \`ᴅᴜʀᴀsɪ\`: *${formatDuration(info.duration)}*\n`
        txt += `╰───────────────\n\n`
        
        txt += `╭─「 📦 *ᴘɪʟɪʜ ᴋᴜᴀʟɪᴛᴀs* 」\n`
        uniqueFormats.forEach((f, i) => {
            txt += `┃ *${i + 1}.* ${f.quality}p\n`
        })
        txt += `╰───────────────\n\n`
        
        txt += `> 💡 *Reply* pesan ini dengan nomor pilihan\n`
        txt += `> Contoh: \`1\` untuk ${uniqueFormats[0]?.quality}p`
        
        const sessionData = {
            key: info.key,
            title: info.title,
            formats: uniqueFormats,
            type: 'video',
            timestamp: Date.now()
        }
        
        const sent = await sock.sendMessage(m.chat, {
            image: { url: info.thumbnail },
            caption: txt
        }, { quoted: m })
        
        global.ytdlSessions.set(sent.key.id, sessionData)
        
        setTimeout(() => {
            global.ytdlSessions.delete(sent.key.id)
        }, 5 * 60 * 1000)
        
    } catch (err) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${err.message}`)
    }
}

async function handleReply(m, { sock }) {
    if (!m.quoted?.id) return false
    
    const session = global.ytdlSessions.get(m.quoted.id)
    if (!session) return false
    
    const choice = parseInt(m.body?.trim())
    if (isNaN(choice) || choice < 1 || choice > session.formats.length) {
        await m.reply(`❌ Pilihan tidak valid. Ketik angka 1-${session.formats.length}`)
        return true
    }
    
    const selectedFormat = session.formats[choice - 1]
    const downloadType = session.type || 'video'
    
    await m.reply(`⏳ *ᴍᴇɴɢᴜɴᴅᴜʜ ${downloadType === 'audio' ? 'audio' : 'video ' + selectedFormat.quality + 'p'}...*`)
    
    try {
        const api = new SaveTubeClient()
        const download = await api.getDownload(session.key, downloadType, selectedFormat.quality)
        
        if (!download?.downloadUrl) {
            return m.reply(`❌ Gagal mendapatkan link download.`)
        }
        
        if (downloadType === 'audio') {
            await sock.sendMessage(m.chat, {
                audio: { url: download.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${session.title}.mp3`
            }, { quoted: m })
        } else {
            await sock.sendMessage(m.chat, {
                video: { url: download.downloadUrl },
                caption: `✅ *ʏᴏᴜᴛᴜʙᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
                    `> 📛 ${session.title}\n` +
                    `> 📦 Kualitas: *${selectedFormat.quality}p*`
            }, { quoted: m })
        }
        
        global.ytdlSessions.delete(m.quoted.id)
        
    } catch (err) {
        await m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message}`)
    }
    
    return true
}

module.exports = {
    config: pluginConfig,
    handler,
    handleReply
}
