import { run } from '@cycle/core'
import {
  makeTelegramDriver,
  reply, answerInlineQuery,
  UpdateMessage, Update, entityIs
} from '../lib/index'
import { matchPlugin } from '../lib/plugins'
import { Observable as $ } from 'rx'

import path from 'path'
import tape from 'tape'
import tapeNock from 'tape-nock'

let test = tapeNock(tape, {
  fixtures: path.join(__dirname, 'fixtures'),
  mode: 'lockdown'
})

const ACCESS_TOKEN = '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11'

test('should reply to messages with basic driver', t => {
  let basicDriver = makeTelegramDriver(ACCESS_TOKEN, { startDate: 1464342407440 })
  let { sources } = run(({ bot }) => ({
    bot: $.from([
      bot.events('message').map(reply({text: 'Cycle.js'}))
    ])
  }), {
    bot: basicDriver
  })

  sources.bot.responses
    .take(1)
    .do(() => sources.bot.dispose())
    .subscribe(message => {
      t.equal(message.text, 'Cycle.js',
        'message text should be equal to `Cycle.js`')
      t.end()
    })
})

test('should reply to inline query with basic driver', t => {
  let basicDriver = makeTelegramDriver(ACCESS_TOKEN)
  let results = [
    {
      type: 'article',
      title: 'Cycle.js',
      input_message_content: {
        message_text:
          'A functional and reactive JavaScript framework for cleaner code'
      },
      id: '2o3aajndy0all3di'
    }
  ]
  let { sources } = run(({bot}) => ({
    bot: $.from([
      bot.events('inline_query').map(answerInlineQuery({ results }))
    ])
  }), {
    bot: basicDriver
  })

  sources.bot.responses
    .take(1)
    .do(() => sources.bot.dispose())
    .subscribe(boolean => {
      t.ok(boolean, 'response should be truthy')
      t.end()
    })
})

test('should reply to command `/help` with basic driver', t => {
  let basicDriver = makeTelegramDriver(ACCESS_TOKEN, { startDate: 1464342407440 })
  let plugins = [
    {
      type: UpdateMessage,
      name: 'help',
      path: /\/(help)(?:@goodmind_test_bot)?(\s+(.+))?/,
      component: ({props}, u) => ({
        bot: $.just(reply({
          text: 'Cycle Telegram v1.1.1 (https://git.io/vrs3P)'
        }, u))
      })},
    {
      type: Update,
      name: 'not-found',
      path: /(?:[\s\S]*)/,
      component: ({props}) => {
        t.fail(`wrong command \`${props[0]}\``)
      }}
  ]
  let { sources } = run(s => ({
    bot: $.from([
      s.bot.events('message')
        .filter(entityIs('bot_command'))
        ::matchPlugin(plugins, s)
        .pluck('bot')
        .mergeAll()
    ])
  }), {
    bot: basicDriver
  })

  sources.bot.responses
    .take(1)
    .do(() => sources.bot.dispose())
    .subscribe(message => {
      t.ok(/\/(help)(?:@goodmind_test_bot)?(\s+(.+))?/.test(message.reply_to_message.text),
        'reply to message text should match `/help` command pattern')
      t.equal(message.text, 'Cycle Telegram v1.1.1 (https://git.io/vrs3P)',
        'message text should be equal to `Cycle Telegram v1.1.1 (https://git.io/vrs3P)`')
      t.end()
    })
})

