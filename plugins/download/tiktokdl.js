const axios = require('axios')

const pluginConfig = {
    name: 'tiktokdl',
    alias: ['ttdown', 'tt', 'tiktok'],
    category: 'download',
    description: 'Download video TikTok tanpa watermark',
    usage: '.tiktokdl <url>',
    example: '.tiktokdl https://vt.tiktok.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    limit: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    
    if (!url) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}tiktokdl <url>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}tiktokdl https://vt.tiktok.com/xxx\``
        )
    }
    
    if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
        return m.reply(`❌ URL tidak valid. Gunakan link TikTok.`)
    }
    
    await m.reply(`⏳ *ᴍᴇɴɢᴜɴᴅᴜʜ ᴠɪᴅᴇᴏ...*`)
    
    try {
        const apiUrl = `https://api.nekolabs.web.id/dwn/tiktok?url=${encodeURIComponent(url)}`
        const { data } = await axios.get(apiUrl)
        
        if (!data?.success || !data?.result?.videoUrl) {
            return m.reply(`❌ Gagal mengambil video. Coba link lain.`)
        }
        
        const result = data.result
        const stats = result.stats || {}
        const author = result.author || {}
        const music = result.music_info || {}
        
        const caption = `✅ *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
            `> 📝 *${result.title?.slice(0, 100) || 'No Title'}*\n\n` +
            `> 👤 Author: ${author.name || 'Unknown'} (${author.username || ''})\n` +
            `> 🎵 Music: ${music.title || 'Unknown'} - ${music.author || ''}\n` +
            `> 📅 Created: ${result.create_at || '-'}\n\n` +
            `> ▶️ Views: ${stats.play || '0'}\n` +
            `> ❤️ Likes: ${stats.like || '0'}\n` +
            `> 💬 Comments: ${stats.comment || '0'}\n` +
            `> 🔄 Shares: ${stats.share || '0'}`
        
        await sock.sendMessage(m.chat, {
            video: { url: result.videoUrl },
            caption: caption
        }, { quoted: m })
        
    } catch (err) {
        return m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
