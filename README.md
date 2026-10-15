# PRK Bot

Автоматизированная система мониторинга, парсинга и рассылки обновлений расписания. Бот отслеживает появление новых Excel-файлов в группе ВКонтакте, разбивает их на таблицы для курсов, групп, преподавателей и кабинетов, конвертирует в изображения и рассылает подписчикам в Telegram.

https://t.me/prk4bot

## Возможности

- Автоматический мониторинг ВК на наличие новых `.xlsx` файлов
- Парсинг общего расписания и генерация персональных версий (по курсам, группам, преподавателям, кабинетам)
- Конвертация Excel → HTML → JPEG через Python `xlsx2html` и Puppeteer
- Telegram-рассылка обновлений подписчикам через `grammy`
- Локальная SQLite база для хранения пользователей и подписок
- Встроенный Express-сервер для веб-интерфейса
- Автоочистка временных файлов

## Технологический стек

**Node.js:** grammy, exceljs, puppeteer, axios, cheerio, sqlite3, express, pm2

**Python:** xlsx2html

## Требования

- Node.js 18+
- Python 3.6+ (с доступом как `python` или `python3`)
- Chrome/Chromium (Puppeteer скачает свой, но на Linux могут понадобиться системные зависимости)

## Установка

```bash
# Клонирование
git clone https://github.com/EdvardCode/prkbot.git
cd prkbot

# Node.js зависимости
npm install

# Python зависимости
pip install xlsx2html
```

## Конфигурация

Создайте файл `cfg.json` в корне проекта:

```json
{
  "vk": {
    "requestdelay": 600,
    "userAgent": "YOUR_USER_AGENT",
    "validuserids": {
      "VK_USER_ID": true
    },
    "schedule": {
      "url": "https://vk.com/topic-GROUP_ID"
    }
  },
  "telegram": {
    "token": "YOUR_TELEGRAM_BOT_TOKEN",
    "admins": {
      "YOUR_TELEGRAM_ID": true
    },
    "emoji": {
      "groups": "🎓",
      "people": "💼",
      "automatization": "⚙️",
      "subs": "📫",
      "getsubs": "📩",
      "close": "❌"
    }
  },
  "excel": {
    "emptyellstyle": {
      "value": " ",
      "fill": {
        "type": "pattern",
        "pattern": "solid",
        "fgColor": { "argb": "FFFFFFFF" },
        "bgColor": { "argb": "FF000000" }
      }
    }
  }
}

```
# Описание полей
- vk.requestdelay — интервал проверки ВК в секундах
- vk.validuserids — ID пользователей ВК, чьи документы считаются валидным расписанием
- vk.schedule.url — ссылка на обсуждение группы, где публикуют расписание
- telegram.token — токен бота от @BotFather
- telegram.admins — ID администраторов бота
- excel.emptyellstyle — стиль пустых ячеек при генерации таблиц

 # Запуск
 ```bash
 node index.js
```
Или
 Установите PM2 - https://pm2.io/docs/runtime/guide/installation/
  ```bash
npm install -g pm2
pm2 start index.js --name prk_bot
pm2 save
pm2 startup
 ```
