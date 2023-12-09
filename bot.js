const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, Discord } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
});


const questions = [
    "Введите Имя и Фамилию (пр. Daniel Priceman):",
	"Введите должность:",
    "Введите номер постановления:",
    "Введите дату (в формате DD.MM.YYYY):",
    "Введите фракцию (ответчик):",
    "Введите ваш Discord:",
    "Введите Discord ответчика:",
    "Введите имя и фамилию лидера фракции (ответчика):",
    "Введите номер обращения или иска, по которому вы пишете постановление (пр. иск DC-21 или обращение GPO-1111):",
    "Введите знак человека (только данные или имя и фамилия):",
    "Введите дату произошедшего на фиксации (в формате DD.MM.YYYY):",
    "Введите имя и фамилию заявителя:",
    "Введите срок исполнения постановления:"
];
const questions2 = [
    "Введите Имя и Фамилию (пр. Daniel Priceman):",
	"Введите должность:",
    "Введите номер постановления:",
    "Введите дату (в формате DD.MM.YYYY):",
    "Введите фракцию (ответчик):",
    "Введите ваш Discord:",
    "Введите Discord ответчика:",
    "Введите имя и фамилию лидера фракции (ответчика):",
    "Введите номер обращения или иска, по которому вы пишете постановление (пр. иск DC-21 или обращение GPO-1111):",
    "Введите знак человека (только данные или имя и фамилия):",
    "Введите срок исполнения постановления:"
];
const questions3 = [
    "Введите Имя и Фамилию (пр. Daniel Priceman):",
	"Введите должность:",
    "Введите номер предписания:",
    "Наказание нарушителю (пр. Уволить, Выписать штраф в размере 5.000$ в казну *фракция*):",
    "Введите дату (в формате DD.MM.YYYY):",
    "Введите фракцию (ответчик):",
    "Введите ваш Discord:",
    "Введите Discord ответчика:",
    "Введите имя и фамилию лидера фракции (ответчика):",
    "Введите собственные материалы или номер обращения, по которому вы пишете предписание (пр. собственными материалами или обращением GPO-1111):",
    "Введите имя и фамилию нарушителя:",
    "Нарушение в род. падеже (пр. устава, статьи 17.1 УАК):"
];

const answers = {};
client.on('ready', () => {
	client.user.setPresence({
		status: 'online',
		activity: {
			type: 'WATCHING',
			name: '',
		},
	});

    console.log('Запущен!');
	const channel = client.channels.cache.get('1043426517314719815');
	 sendStartMessage(channel);
});

let lff = 0;

client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton()) {
        const { customId } = interaction;

        switch (customId) {

            case 'start_interaction':
                askQuestions(interaction.user.id, interaction.channel, 0);
				lff = 1;
                break;
			case 'start_interaction2':
                askQuestions2(interaction.user.id, interaction.channel, 0);
				lff = 2;
                break;
			case 'start_interaction3':
                askQuestions3(interaction.user.id, interaction.channel, 0);
				lff = 3;
                break;
            case 'generate_document':
				if (!answers[interaction.user.id]) {
					interaction.reply('Вы еще не ответили на все вопросы.');
					return;
				}

				try {

					if (lff === 1) {
						const axiosResponse = await axios.post('http://localhost:5000/generate_document', {
							category: '1',
							data: answers[interaction.user.id],
						});
						await interaction.user.send(axiosResponse.data.result);
					}
					if (lff === 2) {
						const axiosResponse = await axios.post('http://localhost:5000/generate_document', {
							category: '2',
							data: answers[interaction.user.id],
						});
						await interaction.user.send(axiosResponse.data.result);
					}
					if (lff === 3) {
						const axiosResponse = await axios.post('http://localhost:5000/generate_document', {
							category: '3',
							data: answers[interaction.user.id],
						});
						await interaction.user.send(axiosResponse.data.result);
					}

					lff = 0;
					const channel = client.channels.cache.get('1043426517314719815');
					sendStartMessage(channel);

				} catch (error) {
					console.error(error);
					interaction.reply("Произошла ошибка при вводе данных. Пожалуйста, попробуйте снова.");
				}
				break;

            default:
                break;
        }

    }
});


async function askQuestions(userId, channel, index) {
    if (index < questions.length) {
        const question = questions[index];

        const questionMessage = await channel.send(question);

        const filter = (response) => response.author.id === userId;
        channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
            .then(async (collected) => {
                const answer = collected.first().content;
                answers[userId] = answers[userId] || {};
                answers[userId][question] = answer;

                await questionMessage.delete().catch(console.error);

                askQuestions(userId, channel, index + 1);
            })
            .catch(() => {
                channel.send('Время вышло. Попробуйте заново.');
				sendStartMessage(channel);
            });
    } else {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('generate_document')
                    .setLabel('Готовое постановление')
                    .setStyle(1),
            );

        channel.send({
            content: '**Все вопросы заданы. Постановление скину в лс. Обратите внимание, генерация длится 20 секунд! Выберите действие:**',
            components: [row],
        });
    }
}

async function askQuestions2(userId, channel, index) {
    if (index < questions2.length) {
        const question2 = questions2[index];

        const questionMessage = await channel.send(question2);

        const filter = (response) => response.author.id === userId;
        channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
            .then(async (collected) => {
                const answer = collected.first().content;
                answers[userId] = answers[userId] || {};
                answers[userId][question2] = answer;
                await questionMessage.delete().catch(console.error);
                askQuestions2(userId, channel, index + 1);
            })
            .catch(() => {
                channel.send('Время вышло. Попробуйте заново.');
            });
    } else {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('generate_document')
                    .setLabel('Готовое постановление')
                    .setStyle(1),
            );

        channel.send({
            content: '**Все вопросы заданы. Постановление скину в лс. Обратите внимание, генерация длится 20 секунд! Выберите действие:**',
            components: [row],
        });
    }
}

async function askQuestions3(userId, channel, index) {
    if (index < questions3.length) {
        const question3 = questions3[index];
        const questionMessage = await channel.send(question3);

        const filter = (response) => response.author.id === userId;
        channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
            .then(async (collected) => {
                const answer = collected.first().content;
                answers[userId] = answers[userId] || {};
                answers[userId][question3] = answer;
                await questionMessage.delete().catch(console.error);
                askQuestions3(userId, channel, index + 1);
            })
            .catch(() => {
                channel.send('Время вышло. Попробуйте заново.');
            });
    } else {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('generate_document')
                    .setLabel('Готовое предписание')
                    .setStyle(1),
            );

        channel.send({
            content: '**Все вопросы заданы. Предписание скину в лс. Обратите внимание, генерация длится 20 секунд! Выберите действие:**',
            components: [row],
        });
    }
}


function sendStartMessage(channel) {
    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('start_interaction')
                .setLabel('Постановление с фиксацией')
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId('start_interaction2')
                .setLabel('Постановление без фиксации')
                .setStyle(1),
			new ButtonBuilder()
                .setCustomId('start_interaction3')
                .setLabel('Предписание')
                .setStyle(1)
        );

    channel.send({
        content: '**Выберите действие:**',
        components: [row],
    });
}

client.login('');
