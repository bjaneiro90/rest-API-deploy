const express = require("express") // require -> Common JS
const app = express()
const crypto = require("node:crypto")
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require("./schemas")

// passa tudo com "*", ou seja, passa TUDO ! Ter cuidado com isto. Passamos as URL que estamos a trabalhar somente por uma questão de seguranca
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      "http://localhost:8080",
      "http://localhost:1234"
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error("Not allowed by CORS"))
  }
}))                 
app.use(express.json())         //acesso ao req.body (middleware)
app.disable('x-powered-by')



//metodos normais = GET/HEAD/POST
//metodos complexos = DELETE/PUT/PATCH
// CORS PRE-flight -> OPTIONS (petição especial para métodos complexos)




app.get('/movies', (req,res) => {
  // ***** ATENÇÃO ******
  // substituido pelo app.use(cors) -> miu
  // // o ORIGIN não vem em petições que sejam da mesma origem
  // const origin = req.header('origin')
  

  // if (ACCEPTED_ORIGINS.includes(origin) || !origin)  {
  //   res.header("Access-Control-Allow-Origin", '*')            // -> solução para problema CORS em navegador , o "*" responde a petição a qualquer URL do servidor 
  // }
  

    // busca pelo genero através do query... "movies?genre=ActIoN"
    const { genre } = req.query
    console.log(req.query)

    if (genre) {
        const filterMovies = movies.filter( movie => 

          // evitar desmatch por case sensitive
            movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()),
            )
            console.log(filterMovies)
    return res.json(filterMovies)
    }
    res.json(movies)
})





app.get('/movies/:id', (req,res) => {   
  // req.params para quando tem que recuperar algo ":" da URL
  
  const {id} = req.params
  const movie = movies.find(movie => movie.id === id )
  console.log(movie)

  movie ? res.json(movie) : res.status(404).json({message: "movie not found"})
})





app.post("/movies", (req,res)=> {
  // req.body para quando tem que recuperar algo ":" da petição
  // const {title, year, director, duration, poster, genre, rate} = req.body
  // ****** ATENÇÃO ******  ---> Comentado acima devido á validação com Zod no video "SOLUCIÓN de CORS y Desarrollo de API REST con Express", minuto 49.48
  const result = validateMovie(req.body)
  console.log(result)
  
  if (result.error) {
    //ou status 422 
    return res.status(400).json({error: JSON.parse(result.error.message)})
  }
  console.log(req.body)
  
  const newMovie = {
    id: crypto.randomUUID(),        // uuid (unique ID)v4
    ...result.data                  // aqui sim podemos passar result.data porque a info já foi validada com Zod. No caso de n ter validação, seguir o que foi comentado acima.  
    // title,
        // year,
        // director,
        // duration,
        // poster,
        // genre,
        // rate: rate ?? 0
      }
    
      movies.push(newMovie)
      console.log(movies)
      
      res.status(201).json(newMovie)  // atualiza a caché do cliente
    })
    
    
    
    
    
    
app.delete('/movies/:id', (req, res) => {
  // buscar o id ao paramentro da URL
  const { id } = req.params
  
  
  // procuramos a info do filme com o Id fornecido anteriormente
  const movieIndex = movies.findIndex(movie => movie.id === id)
  
  
  // se não existe, erro!
  if (movieIndex === -1) {
    res.status(404).json({message: "Movie not found"})
  }

  
  // removemos o conteúdo entre o MovieIndex "(0)" até ao 1.
  movies.slice(movieIndex, 1)
  
  return res.json({message: "Movie deleted"})
  
})






app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  
  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
    
    const updateMovie = {
      ...movies[movieIndex],
      ...result.data
    }
    
    movies[movieIndex] = updateMovie
    
    return res.json(updateMovie)
  })
  
  
  const PORT = process.env.PORT ?? 1234
  
  app.listen(1234, () => {
    console.log(`servidor a funcionar no link http://localhost:${PORT}`)
  })