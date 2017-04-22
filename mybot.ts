import { Wechaty, Room } from 'wechaty'
import axios from 'axios'

const qs = require('qs');
const Robot = require('tuling123-client')
const { TULING123_API_KEY, SCKEY } = require('./config')
const tuling = new Robot(TULING123_API_KEY)
const bot = Wechaty.instance({ profile: 'local' })

let pushMessage = ({ text, desp }) => {
  console.log('pushMessage:', text, ':', desp)
  axios.post(`http://sc.ftqq.com/${SCKEY}.send`, qs.stringify({ text, desp })).then(result => {
    console.log('axios: ', result.data)
  }).catch(err => console.error)
}

bot
  .on('login', user => console.info('Bot', `${user.name()} logined`))
  .on('logout', user => console.info('Bot', `${user.name()} logouted`))
  .on('error', e => {
    console.info('Bot', 'error: %s', e)

  })
  .on('scan', (url, code) => {
    if (!/201|200/.test(String(code))) {
      let loginUrl = url.replace('qrcode', 'l')
      require('qrcode-terminal').generate(loginUrl)
      pushMessage({
        text: '扫码请求',
        desp: loginUrl
      })
      console.log(url)
    }
  })

  .on('friend', async function (contact, request) {
    if (request) {
      await request.accept()
      console.log(`Contact: ${contact.name()} send request ${request.hello}`)
    }
  })

  .on('message', async function (m) {
    const contact = m.from()
    const content = m.content()
    const room = m.room()

    if (m.self()) return
    if (room) {
      console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`)
      return
    }
    if (/进群/.test(content)) {
      console.log(`加${contact.name()}进群`)
      try {
        let keyroom = await Room.find({ topic: /邻居儿/ })
        if (keyroom) {
          await keyroom.add(contact)
          await keyroom.say("欢迎新同学~", contact)
        }
      } catch (e) {
        console.error(e)
      }
      return
    }
    if (/hello/.test(content)) {
      m.say("hello how are you")
      return
    }
    if (/你已添加了/.test(content)) {
      return contact.say('好开心你来找我啦，回复“进群”让我把你拉进邻居儿的小屋吧!')
    } else {
      tuling.ask(m.content(), { userid: m.from() })
        .then(({ text }) => {
          console.info('Tuling123', `Talker reply:"${text}" for "${m.content()}" `)
          m.say(text)
        })
        .catch(err => {
          console.error('Bot', 'on message rejected: %s', err)
        })
    }
  })

  .init()