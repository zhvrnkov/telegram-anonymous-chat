const TelegramBot = require('node-telegram-bot-api'),
		mysql       = require('mysql');

const token = '...';

const bot = new TelegramBot(token, {polling: true});

const pool = mysql.createPool({
	host		: "...",
	database : "...",
	user		: "...",
	password : "..."
});

bot.onText(/\/start/, (msg) => {
	pool.query('select * from telegram', (err, res) => {
		if(err) {
			throw err;
		}
		if(res[0] == undefined) {
			pool.query('insert into telegram set ?', {fPers: msg.chat.id, sPers: 0});
		} else {
			pool.query('update telegram set ? where ?', [{sPers: msg.chat.id}, {fPers: res[res.length - 1].fPers}]);
			pool.query('select * from telegram', (err, res) => {
				if(err) throw err;
				var m, y, chat;
				chat = res;

				bot.sendMessage(chat[0].fPers, "Interlocutor found.");
				bot.sendMessage(chat[0].sPers, "Interlocutor found.");

				pool.query('delete from telegram');

				bot.on('message', (msg) => {
					if(res[0].fPers == msg.chat.id) {
						m = res[0].fPers;
						y = res[0].sPers;
					} else {
						m = res[0].sPers;
						y = res[0].fPers;
					}

					bot.sendMessage(y, msg.text);
				});

				bot.onText(/\/end/, (msg) => {
					if(res[0].fPers == msg.chat.id) {
						m = res[0].fPers;
						y = res[0].sPers;
					} else {
						m = res[0].sPers;
						y = res[0].fPers;
					}


					bot.sendMessage(m, "Chat was ended.");
					bot.sendMessage(y, "Your interlocutor was quit");

					chat.splice(0, 2);

					console.log(chat)
				});
			})
		}
	});
		
}); 