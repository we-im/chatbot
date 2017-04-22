import { Wechaty, Room } from 'wechaty'
import axios from 'axios'
const bot = Wechaty.instance()

bot
  .on('login', user => console.info('Bot', `${user.name()} logined`))
  .on('logout', user => console.info('Bot', `${user.name()} logouted`))
  .on('error', e => {
    console.info('Bot', 'error: %s', e)
    axios.post('http://sc.ftqq.com/SCU7725T413fb12116bf09f6b5771eb9db36fd4258faeb664e15d.send', {
      text: '出问题啦',
      desp: e.toString()
    })
  })
  .on('scan', (url, code) => {
    let loginUrl = url.replace('qrcode', 'l')
    require('qrcode-terminal').generate(loginUrl)
    axios.post('http://sc.ftqq.com/SCU7725T413fb12116bf09f6b5771eb9db36fd4258faeb664e15d.send', {
      text: '出问题啦',
      desp: '要重新扫码~'
    })
    console.log(url)
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

    if (m.self()) {
      return
    }
    if (room) {
      console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${content}`)
    } else {
      console.log(`Contact: ${contact.name()} Content: ${content}`)
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

      }
    }

    if (/hello/.test(content)) {
      m.say("hello how are you")
    }
  })

  .init()