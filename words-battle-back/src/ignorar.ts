// import { parse } from 'node-html-parser'
// import axios from 'axios';

// app.post('/search', async(req, res)=> {

//     const body = req.body;

// 	const wordId = body.word.toLowerCase();

//     let filteredWords: string[] = []
//     try {
//         const { data: wordTextList} = await axios.get(`https://www.wordreference.com/autocomplete?dict=eses&query=${wordId}`, {headers: {"Access-Control-Allow-Origin": "*"}})
//         const lines = wordTextList.split('\n')
//         const words = lines.map((line:String) => {
//             const word = line.split('\t')[0].trim()
//             return word
//         })

//         filteredWords = words.filter((word:string) => word !== "")

//         if (!filteredWords.includes(wordId)) {
//             return res.json([{definitions: "no word found", id: "error"}])
//         }
//     } catch(err) {
//         return res.json([{definitions: "no word found", id: "error"}])
//     }

//     try {
//         const {data: htmlResult} = await axios.get(`https://www.wordreference.com/definicion/${wordId}`, {headers: {"Access-Control-Allow-Origin": "*"}})
//         const root = parse(htmlResult)
//         const main = root.querySelector('.entry')
//         if (!main?.text) {
//             console.log("TIRANDO ERROR")
//             throw Error;
//         }
//         return res.json([{definitions: main?.text, id: 1}])
//     } catch(err) {
//         console.log("TIRANDO ERROR EN CATCH DIRECTAMENTE", err)
//         return res.json([{definitions: "no word found", id: "error"}])
//     }
// })
