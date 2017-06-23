const colors = require('colors')
const axios = require('axios')
const moment = require('moment')

const userNames = ['Shitty_Watercolour', 'GovSchwarzenegger']
const intervalInMilliseconds = 20000
const apiEndpointUrlTemplate = 'https://www.reddit.com/user/[USERNAME]/comments.json'
const itemsPerUser = 5

let tickerId = null

const init = () => {
  console.log('Stalking of ' + (userNames.join(', ')) + 'commencing...'.green)
  tick()
  tickerId = setInterval(tick, intervalInMilliseconds)
}

const getEndpointUrl = userName => {
  return apiEndpointUrlTemplate.replace('[USERNAME]', userName)
}

const tick = () => {
  userNames.forEach(userName => {
    console.log('Pinging "' + userName + '"...')
    const url = getEndpointUrl(userName)
    axios.get(url)
      .then(response => {
        render(userName, response.data.data.children.slice(0, itemsPerUser))
      })
      .catch(console.error)
  })
}

const render = (userName, items) => {
  console.log('\n-----------------\n')
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
  return `(${upVotes}) - ${timeStampString}: ${userName.cyanBG.black} said "${bodyPreview}" @ ${subRedditString}\n\t-> ${link}\n`
}

init()
