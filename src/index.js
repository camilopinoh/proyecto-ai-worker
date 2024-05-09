//import { Ai } from '@cloudflare/ai'
import { Hono } from 'hono/quick'

import blocking from './blocking.html'
import streaming from './streaming.html'

const app = new Hono()

app.get('/', c => {
	return c.html(streaming)
})

app.get('/b', c =>{
	return c.html(blocking)
})

app.get('/stream', async c =>{
	const ai = c.env.AI

	const query = c.req.query("query") // ?query=Hola Como estas?
	const question = query || 'How are you?'

	const messages = [
		{ role: "system", content: "Eres una amable asistente" },
		{ role: "user", content: question },
	]

	const aiResponse = await ai.run(
		'@cf/meta/llama-3-8b-instruct',
		{ messages, stream: true }
	)

	return new Response(aiResponse, {
		headers:{
			'Content-Type': 'text/event-stream'
		}
	})
})

app.post('/', async c =>{
	//const ai = new Ai(c.env.AI)
	const ai = c.env.AI

	const body = await c.req.json()
	const question = body.query || 'How are you?'

	const messages = [
		{ role: "system", content: "Eres una amable asistente" },
		{ role: "user", content: question },
	]
	
	const aiResponse = await ai.run(
		'@cf/meta/llama-3-8b-instruct',
		{ messages }
	)

	return c.text(aiResponse.response)
})

export default app