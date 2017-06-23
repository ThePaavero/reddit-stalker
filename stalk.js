const colors = require('colors')
const axios = require('axios')
const moment = require('moment')
const config = require('./config.json')

const userNames = config.userNames
const clearTerminalOnTick = config.clearTerminalOnTick
const intervalInMilliseconds = config.pingIntervalInSeconds * 1000
const apiEndpointUrlTemplate = 'https://www.reddit.com/user/[USERNAME]/comments.json'
const itemsPerUser = config.itemsPerUser

let tickerId = null

const init = () => {
  console.log('Stalking of ' + (userNames.join(', ')) + ' commencing...')
  tick()
  tickerId = setInterval(tick, intervalInMilliseconds)
}

const getEndpointUrl = userName => {
  return apiEndpointUrlTemplate.replace('[USERNAME]', userName)
}

const tick = () => {
  if (clearTerminalOnTick) {
    clearTerminal()
  }
  userNames.forEach(userName => {
    const url = getEndpointUrl(userName)
    axios.get(url)
      .then(response => {
        render(userName, response.data.data.children.slice(0, itemsPerUser))
        if (userNames.indexOf(userName) !== userNames.length - 1) {
          printHorizontalRule()
        }
      })
      .catch(console.error)
  })
}

const printHorizontalRule = () => {
  console.log('\n------------------------------\n'.gray)
}

const clearTerminal = () => {
  process.stdout.write('\033c')
}

const render = (userName, items) => {
  let output = ''
  items.forEach(commentObject => {
    output += parseCommentObjectToOutput(userName, commentObject.data)
  })
  console.log(output)
}

const parseCommentObjectToOutput = (userName, comment) => {
  const subRedditString = comment.subreddit
  if (subRedditString === 'undefined') {
    return ''
  }
  const commentString = comment.body
  const link = comment.link_permalink.gray
  const upVotes = comment.ups.toString().green
  const bodyPreview = (commentString.replace(/\n/g, '').substr(0, 30) + '...').yellowBG.black
  const timeStampString = moment.unix(comment.created_utc).format('YYYY.MM.DD HH:mm:SS')
  return `(${upVotes})\t${timeStampString}: ${userName.cyanBG.black} said "${bodyPreview}" @ ${subRedditString}\n\t\t-> ${link}\n\n`
}

init()
