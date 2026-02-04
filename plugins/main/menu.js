const config = require('../../config');
const { formatUptime, getTimeGreeting } = require('../../src/lib/formatter');
const { getCommandsByCategory, getCategories } = require('../../src/lib/plugins');
const { getDatabase } = require('../../src/lib/database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { generateWAMessageFromContent, proto } = require('ourin');
/**
 * Credits & Thanks to
 * Developer = Lucky Archz ( Zann )
 * Lead owner = HyuuSATAN
 * Owner = Keisya
 * Designer = Danzzz
 * Wileys = Penyedia baileys
 * Penyedia API
 * Penyedia Scraper
 * 
 * JANGAN HAPUS/GANTI CREDITS & THANKS TO
 * JANGAN DIJUAL YA MEKS
 * 
 * Saluran Resmi Ourin:
 * https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t 
 * 
 */
const pluginConfig = {
    name: 'menu',
    alias: ['help', 'bantuan', 'commands', 'm'],
    category: 'main',
    description: 'Menampilkan menu utama bot',
    usage: '.menu',
    example: '.menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    limit: 0,
    isEnabled: true
};

const CATEGORY_EMOJIS = {
    owner: '👑', main: '🏠', utility: '🔧', fun: '🎮', group: '👥',
    download: '📥', search: '🔍', tools: '🛠️', sticker: '🖼️',
    ai: '🤖', game: '🎯', media: '🎬', info: 'ℹ️', religi: '☪️',
    panel: '🖥️', user: '📊'
};

function toSmallCaps(text) {
    const smallCaps = {
        'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ',
        'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ',
        'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ',
        'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
    };
    return text.toLowerCase().split('').map(c => smallCaps[c] || c).join('');
}

function formatTime(date) {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateShort(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function buildMenuText(m, botConfig, db, uptime, botMode = 'md') {
    const prefix = botConfig.command?.prefix || '.';
    const user = db.getUser(m.sender);
    const now = new Date();
    const timeStr = formatTime(now);
    const dateStr = formatDateShort(now);
    
    const categories = getCategories();
    const commandsByCategory = getCommandsByCategory();
    
    let totalCommands = 0;
    for (const category of categories) {
        totalCommands += (commandsByCategory[category] || []).length;
    }
    
    let userRole = 'User', roleEmoji = '👤';
    if (m.isOwner) { userRole = 'Owner'; roleEmoji = '👑'; }
    else if (m.isPremium) { userRole = 'Premium'; roleEmoji = '💎'; }
    
    const greeting = getTimeGreeting();
    const uptimeFormatted = formatUptime(uptime);
    const totalUsers = db.getUserCount();
    const greetEmoji = greeting.includes('pagi') ? '🌅' : greeting.includes('siang') ? '☀️' : greeting.includes('sore') ? '🌇' : '🌙';
    
    let txt = '';
    txt += `${greetEmoji} *Halo ${m.pushName}! ${greeting}*
\n`
    txt += `> ᴏᴜʀɪɴ ᴀɪ ᴀᴅᴀʟᴀʜ ʙᴏᴛ ᴀᴛᴀᴜ ᴘʀᴏɢʀᴀᴍ ᴏᴛᴏᴍᴀᴛɪꜱ ʏᴀɴɢ ʙᴇʀᴊᴀʟᴀɴ ᴅɪ ᴡʜᴀᴛꜱᴀᴘᴘ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ꜰɪᴛᴜʀ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ. ꜰɪᴛᴜʀ ᴍᴜʟᴛɪ-ᴅᴇᴠɪᴄᴇ ᴍᴇᴍᴜɴɢᴋɪɴᴋᴀɴ ᴀᴋᴜɴ ᴡʜᴀᴛꜱᴀᴘᴘ ᴜᴛᴀᴍᴀ ᴛᴇʀʜᴜʙᴜɴɢ ᴋᴇ ʙᴇʙᴇʀᴀᴘᴀ ᴘᴇʀᴀɴɢᴋᴀᴛ ꜱᴇᴄᴀʀᴀ ʙᴇʀꜱᴀᴍᴀᴀɴ ᴛᴀɴᴘᴀ ᴘᴇʀʟᴜ ꜱᴇʟᴀʟᴜ ᴛᴇʀʜᴜʙᴜɴɢ ᴅɪ ꜱᴍᴀʀᴛᴘʜᴏɴᴇ\n\n`
    txt += `🤖 *ʙᴏᴛ ɪɴꜰᴏ* 」\n`;
    txt += `◦ ɴᴀᴍᴀ: *${botConfig.bot?.name || 'Ourin-AI'}*\n`;
    txt += `◦ ᴠᴇʀsɪ: *v${botConfig.bot?.version || '1.2.0'}*\n`;
    txt += `◦ ᴍᴏᴅᴇ: *${(botConfig.mode || 'public').toUpperCase()}*\n`;
    txt += `◦ ᴘʀᴇꜰɪx: *[ ${prefix} ]*\n`;
    txt += `◦ ᴜᴘᴛɪᴍᴇ: *${uptimeFormatted}*\n`;
    txt += `◦ ᴛᴏᴛᴀʟ ᴜsᴇʀ: *${totalUsers}*\n`;
    txt += `◦ ᴛᴏᴛᴀʟ ᴄᴍᴅ: *${totalCommands}*\n`;
    txt += `◦ ɢʀᴏᴜᴘ ᴍᴏᴅᴇ: *${botMode.toUpperCase()}*\n`;
    txt += `\n`;
    
    txt += ` 👤 *ᴜsᴇʀ ɪɴꜰᴏ* 」\n`;
    txt += `◦ ɴᴀᴍᴀ: *${m.pushName}*\n`;
    txt += `◦ ʀᴏʟᴇ: *${roleEmoji} ${userRole}*\n`;
    txt += `◦ ʟɪᴍɪᴛ: *${m.isOwner || m.isPremium ? '∞ Unlimited' : (user?.limit ?? 25)}*\n`;
    txt += `◦ ᴡᴀᴋᴛᴜ: *${timeStr} WIB*\n`;
    txt += `◦ ᴛᴀɴɢɢᴀʟ: *${dateStr}*\n`;
    txt += `\n`;
    
    const categoryOrder = ['owner', 'main', 'utility', 'tools', 'fun', 'game', 'download', 'search', 'sticker', 'media', 'ai', 'group', 'religi', 'info'];
    const sortedCategories = categories.sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
    
    if (botMode === 'cpanel') {
        txt += `╭┈┈⬡「 📦 *ᴄʀᴇᴀᴛᴇ sᴇʀᴠᴇʀ* 」\n`;
        for (let i = 0; i <= 11; i++) {
            txt += `┃ ◦ \`${prefix}${i + 1}gb\`\n`;
        }
        txt += `┃ ◦ \`${prefix}unli\` / \`${prefix}unlimited\`\n`;
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        
        txt += `╭┈┈⬡「 👥 *sᴇʟʟᴇʀ & ᴏᴡɴᴇʀ ᴘᴀɴᴇʟ* 」\n`;
        txt += `┃ ◦ \`${prefix}addseller\` \`${prefix}delseller\`\n`;
        txt += `┃ ◦ \`${prefix}listseller\`\n`;
        txt += `┃ ◦ \`${prefix}addownpanel\` \`${prefix}delownpanel\`\n`;
        txt += `┃ ◦ \`${prefix}listownpanel\`\n`;
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        
        txt += `╭┈┈⬡「 🔐 *ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ* 」\n`;
        txt += `┃ ◦ \`${prefix}cadmin\` - Create admin\n`;
        txt += `┃ ◦ \`${prefix}deladmin\` - Hapus admin\n`;
        txt += `┃ ◦ \`${prefix}listadmin\` - List admin\n`;
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        
        txt += `╭┈┈⬡「 🖥️ *sᴇʀᴠᴇʀ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ* 」\n`;
        txt += `┃ ◦ \`${prefix}listserver\` - List server\n`;
        txt += `┃ ◦ \`${prefix}delserver\` - Hapus server\n`;
        txt += `┃ ◦ \`${prefix}serverinfo\` - Info server\n`;
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        
        txt += `╭┈┈⬡「 ⚙️ *sᴇᴛᴛɪɴɢs* 」\n`;
        txt += `┃ ◦ \`${prefix}botmode\` - Ubah mode\n`;
        txt += `┃ ◦ \`${prefix}cpanel\` - Menu cpanel\n`;
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
    } else {
        for (const category of sortedCategories) {
            if (category === 'owner' && !m.isOwner) continue;
            if (category === 'panel') continue;
            const commands = commandsByCategory[category] || [];
            if (commands.length === 0) continue;
            
            const emoji = CATEGORY_EMOJIS[category] || '📋';
            const categoryName = toSmallCaps(category);
            
            txt += `╭┈┈⬡「 ${emoji} *${categoryName}* 」\n`;
            for (const cmd of commands) {
                txt += `┃ ◦ \`${prefix}${toSmallCaps(cmd)}\`\n`;
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
        }
    }
    
    txt += `_© ${botConfig.bot?.name || 'Ourin-AI'} | ${new Date().getFullYear()}_\n`;
    txt += `_ᴅᴇᴠᴇʟᴏᴘᴇʀ: ${botConfig.bot?.developer || 'Lucky Archz'}_`;
    
    return txt;
}

function getContextInfo(botConfig, m, thumbBuffer, renderLargerThumbnail = false) {
    const saluranId = botConfig.saluran?.id || '120363208449943317@newsletter';
    const saluranName = botConfig.saluran?.name || botConfig.bot?.name || 'Ourin-AI';
    const saluranLink = botConfig.saluran?.link || '';
    
    const ctx = {
        mentionedJid: [m.sender],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        },
        externalAdReply: {
            title: botConfig.bot?.name || 'Ourin-AI',
            body: `ᴠ${botConfig.bot?.version || '1.2.0'} • ${(botConfig.mode || 'public').toUpperCase()}`,
            sourceUrl: saluranLink,
            mediaType: 1,
            showAdAttribution: false,
            renderLargerThumbnail
        }
    };
    
    if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
    return ctx;
}

function getVerifiedQuoted(botConfig) {
    const saluranId = botConfig.saluran?.id || '120363208449943317@newsletter';
    const saluranName = botConfig.saluran?.name || botConfig.bot?.name || 'Ourin-AI';
    
    return {
        key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast' },
        message: {
            extendedTextMessage: {
                text: `✨ *${botConfig.bot?.name || 'Ourin-AI'}* ✨\nꜰᴀsᴛ ʀᴇsᴘᴏɴsᴇ ʙᴏᴛ`,
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
    };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
    const savedVariant = db.setting('menuVariant');
    const menuVariant = savedVariant || botConfig.ui?.menuVariant || 2;
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {};
    const botMode = groupData.botMode || 'md';
    const text = buildMenuText(m, botConfig, db, uptime, botMode);
    
    const imagePath = path.join(process.cwd(), 'assets', 'images', 'ourin.jpg');
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin2.jpg');
    const videoPath = path.join(process.cwd(), 'assets', 'video', 'ourin.mp4');
    
    let imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;
    let thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;
    let videoBuffer = fs.existsSync(videoPath) ? fs.readFileSync(videoPath) : null;
    
    try {
        switch (menuVariant) {
            case 1:
                if (imageBuffer) {
                    await sock.sendMessage(m.chat, { image: imageBuffer, caption: text });
                } else {
                    await m.reply(text);
                }
                break;
                
            case 2:
                const msgV2 = { contextInfo: getContextInfo(botConfig, m, thumbBuffer) };
                if (imageBuffer) {
                    msgV2.image = imageBuffer;
                    msgV2.caption = text;
                } else {
                    msgV2.text = text;
                }
                await sock.sendMessage(m.chat, msgV2, { quoted: getVerifiedQuoted(botConfig) });
                break;
                
            case 3:
                let resizedThumb = thumbBuffer;
                if (thumbBuffer) {
                    try {
                        resizedThumb = await sharp(thumbBuffer)
                            .resize(300, 300, { fit: 'cover' })
                            .jpeg({ quality: 80 })
                            .toBuffer();
                    } catch (e) {
                        resizedThumb = thumbBuffer;
                    }
                }
                await sock.sendMessage(m.chat, {
                    document: imageBuffer || Buffer.from(''),
                    mimetype: 'ɴᴏ ᴘᴀɪɴ ɴᴏ ɢᴀɪɴ',
                    fileLength: 9999999999,
                    fileSize: 9999999999,
                    caption: text,
                    jpegThumbnail: resizedThumb,
                    contextInfo: getContextInfo(botConfig, m, fs.readFileSync(path.join(process.cwd(), 'assets', 'images', 'ourin.jpg')) || 'Ourin-AI', true)
                }, { quoted: getVerifiedQuoted(botConfig) });
                break;
                
            case 4:
                if (videoBuffer) {
                    await sock.sendMessage(m.chat, {
                        video: videoBuffer,
                        caption: text,
                        gifPlayback: true,
                        contextInfo: getContextInfo(botConfig, m, thumbBuffer)
                    }, { quoted: getVerifiedQuoted(botConfig) });
                } else {
                    const fallback = { contextInfo: getContextInfo(botConfig, m, thumbBuffer) };
                    if (imageBuffer) { fallback.image = imageBuffer; fallback.caption = text; }
                    else { fallback.text = text; }
                    await sock.sendMessage(m.chat, fallback, { quoted: getVerifiedQuoted(botConfig) });
                }
                break;
                
            case 5:
                const prefix = botConfig.command?.prefix || '.';
                const saluranId = botConfig.saluran?.id || '120363208449943317@newsletter';
                const saluranName = botConfig.saluran?.name || botConfig.bot?.name || 'Ourin-AI';
                
                const categories = getCategories();
                const commandsByCategory = getCommandsByCategory();
                const categoryOrder = ['owner', 'main', 'utility', 'tools', 'fun', 'game', 'download', 'search', 'sticker', 'media', 'ai', 'group', 'religi', 'info', 'jpm', 'pushkontak', 'panel', 'user'];
                
                const sortedCats = categories.sort((a, b) => {
                    const indexA = categoryOrder.indexOf(a);
                    const indexB = categoryOrder.indexOf(b);
                    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                });
                
                const toMonoUpperBold = (text) => {
                    const chars = {
                        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
                        'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
                        'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
                        'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭'
                    };
                    return text.toUpperCase().split('').map(c => chars[c] || c).join('');
                };
                
                const categoryRows = [];
                for (const cat of sortedCats) {
                    if (cat === 'owner' && !m.isOwner) continue;
                    const cmds = commandsByCategory[cat] || [];
                    if (cmds.length === 0) continue;
                    
                    const emoji = CATEGORY_EMOJIS[cat] || '📁';
                    const title = `${emoji} ${toMonoUpperBold(cat)}`;
                    
                    categoryRows.push({
                        title: title,
                        id: `${prefix}menucat ${cat}`,
                        description: `${cmds.length} commands`
                    });
                }
                
                let totalCmds = 0;
                for (const cat of categories) {
                    totalCmds += (commandsByCategory[cat] || []).length;
                }
                
                const now = new Date();
                const greeting = getTimeGreeting();
                const greetEmoji = greeting.includes('pagi') ? '🌅' : greeting.includes('siang') ? '☀️' : greeting.includes('sore') ? '🌇' : '🌙';
                const uptimeFormatted = formatUptime(uptime);
                
                let headerText = `${greetEmoji} *ʜᴀʟʟᴏ, @${m.sender.split('@')[0]}!*\n\n`;
                headerText += `> *${greeting}!* sᴇʟᴀᴍᴀᴛ ᴅᴀᴛᴀɴɢ ᴅɪ *${botConfig.bot?.name || 'Ourin-AI'}* ✨\n\n`;
                headerText += `╭┈┈⬡「 🤖 *ʙᴏᴛ ɪɴꜰᴏ* 」\n`;
                headerText += `┃ ◦ ɴᴀᴍᴀ: *${botConfig.bot?.name || 'Ourin-AI'}*\n`;
                headerText += `┃ ◦ ᴠᴇʀsɪ: *v${botConfig.bot?.version || '1.2.0'}*\n`;
                headerText += `┃ ◦ ᴍᴏᴅᴇ: *${(botConfig.mode || 'public').toUpperCase()}*\n`;
                headerText += `┃ ◦ ᴜᴘᴛɪᴍᴇ: *${uptimeFormatted}*\n`;
                headerText += `┃ ◦ ᴛᴏᴛᴀʟ ᴄᴍᴅ: *${totalCmds}*\n`;
                headerText += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
                headerText += `> 📋 *Pilih kategori di bawah untuk melihat daftar command*`;
                
                try {
                    const buttons = [
                        {
                            name: 'single_select',
                            buttonParamsJson: JSON.stringify({
                                title: '📁 ᴘɪʟɪʜ ᴍᴇɴᴜ',
                                sections: [{
                                    title: '📋 ᴘɪʟɪʜ ᴍᴇɴᴜ',
                                    rows: categoryRows
                                }]
                            })
                        },
                        {
                            name: 'quick_reply',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📊 ᴛᴏᴛᴀʟ ᴘɪᴛᴜʀ',
                                id: `${prefix}totalfitur`
                            })
                        }
                    ];
                    
                    await sock.sendMessage(m.chat, {
                        image: imageBuffer,
                        caption: headerText,
                        footer: `© ${botConfig.bot?.name || 'Ourin-AI'} | ${sortedCats.length} Categories`,
                        interactiveButtons: buttons,
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 9999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: saluranId,
                                newsletterName: saluranName,
                                serverMessageId: 127
                            }
                        }
                    }, { quoted: getVerifiedQuoted(botConfig) });
                    
                } catch (btnError) {
                    console.error('[Menu V5] Button error:', btnError.message);
                    
                    let catListText = `📋 *ᴋᴀᴛᴇɢᴏʀɪ ᴍᴇɴᴜ*\n\n`;
                    for (const cat of sortedCats) {
                        if (cat === 'owner' && !m.isOwner) continue;
                        const cmds = commandsByCategory[cat] || [];
                        if (cmds.length === 0) continue;
                        const emoji = CATEGORY_EMOJIS[cat] || '📁';
                        catListText += `> ${emoji} \`${prefix}menucat ${cat}\` - ${toMonoUpperBold(cat)} (${cmds.length})\n`;
                    }
                    catListText += `\n_Ketik perintah kategori untuk melihat command_`;
                    
                    const fallbackMsg = { contextInfo: getContextInfo(botConfig, m, thumbBuffer) };
                    if (imageBuffer) { fallbackMsg.image = imageBuffer; fallbackMsg.caption = headerText + '\n\n' + catListText; }
                    else { fallbackMsg.text = headerText + '\n\n' + catListText; }
                    await sock.sendMessage(m.chat, fallbackMsg, { quoted: getVerifiedQuoted(botConfig) });
                }
                break;
                
            case 6:
                const thumbPathV6 = path.join(process.cwd(), 'assets', 'images', 'ourin3.jpg');
                const saluranIdV6 = botConfig.saluran?.id || '120363208449943317@newsletter';
                const saluranNameV6 = botConfig.saluran?.name || botConfig.bot?.name || 'Ourin-AI';
                const saluranLinkV6 = botConfig.saluran?.link || 'https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t';
                
                let bannerThumbV6 = null;
                
                try {
                    const sourceBuffer = fs.existsSync(thumbPathV6) 
                        ? fs.readFileSync(thumbPathV6) 
                        : (thumbBuffer || imageBuffer);
                    
                    if (sourceBuffer) {
                        bannerThumbV6 = await sharp(sourceBuffer)
                            .resize(200, 200, { fit: 'inside' })
                            .jpeg({ quality: 90 })
                            .toBuffer();
                    }
                } catch (resizeErr) {
                    console.error('[Menu V6] Resize error:', resizeErr.message);
                    bannerThumbV6 = thumbBuffer;
                }
                
                const contextInfoV6 = {
                    mentionedJid: [m.sender],
                    forwardingScore: 9999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranIdV6,
                        newsletterName: saluranNameV6,
                        serverMessageId: 127
                    },
                    externalAdReply: {
                        title: botConfig.bot?.name || 'Ourin-AI',
                        body: `v${botConfig.bot?.version || '1.0.1'} • Fast Response Bot`,
                        sourceUrl: saluranLinkV6,
                        mediaType: 1,
                        showAdAttribution: false,
                        renderLargerThumbnail: true,
                        thumbnail: fs.readFileSync("./assets/images/ourin.jpg")
                    }
                };
                
                try {
                    await sock.sendMessage(m.chat, {
                        document: imageBuffer || Buffer.from('Ourin-AI Menu'),
                        mimetype: 'application/pdf',
                        fileName: `ɴᴏ ᴘᴀɪɴ ɴᴏ ɢᴀɪɴ`,
                        fileLength: 9999999999,
                        caption: text,
                        jpegThumbnail: bannerThumbV6,
                        contextInfo: contextInfoV6
                    }, { quoted: getVerifiedQuoted(botConfig) });
                    
                } catch (v6Error) {
                    console.error('[Menu V6] Error:', v6Error.message);
                    const fallbackV6 = { contextInfo: getContextInfo(botConfig, m, thumbBuffer) };
                    if (imageBuffer) { fallbackV6.image = imageBuffer; fallbackV6.caption = text; }
                    else { fallbackV6.text = text; }
                    await sock.sendMessage(m.chat, fallbackV6, { quoted: getVerifiedQuoted(botConfig) });
                }
                break;
                
            default:
                await m.reply(text);
        }
        const audioPath = path.join(process.cwd(), 'assets', 'audio', 'ourin.mp3');
        if (fs.existsSync(audioPath)) {
            const { execSync } = require('child_process');
            const tempOpus = path.join(process.cwd(), 'assets', 'audio', 'temp_vn.opus');
            try {
                execSync(`ffmpeg -y -i "${audioPath}" -c:a libopus -b:a 64k "${tempOpus}"`, { stdio: 'ignore' });
                await sock.sendMessage(m.chat, {
                    audio: fs.readFileSync(tempOpus),
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true,
                    contextInfo: getContextInfo(botConfig, m, thumbBuffer)
                }, { quoted: getVerifiedQuoted(botConfig) });
                
                if (fs.existsSync(tempOpus)) fs.unlinkSync(tempOpus);
            } catch (ffmpegErr) {
                await sock.sendMessage(m.chat, {
                    audio: fs.readFileSync(audioPath),
                    mimetype: 'audio/mpeg',
                    ptt: true,
                    contextInfo: getContextInfo(botConfig, m, thumbBuffer)
                }, { quoted: getVerifiedQuoted(botConfig) });
            }
        }
    } catch (error) {
        console.error('[Menu] Error on command execution:', error.message);
    }
}

module.exports = {
    config: pluginConfig,
    handler
};
