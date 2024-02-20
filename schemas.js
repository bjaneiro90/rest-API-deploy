const z = require("zod")                                // a validação só filtra aquilo que é suposto validar. os restantes parametros, ignora completamente.

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: "Movie title must be a string",
        required_error: "Movie title is required."    
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).optional(),
    poster: z.string().url({
        message: "Poster must be a valid URL"
    }),
    genre: z.array(
            z.enum([ 
            "Action",
            "Crime",
            "Drama",
            "Adventure",
            "Sci-Fi",
            "Romance",
            "Biography",
            "Comedy",
            "Horror",
        ]), {
            invalid_type_error: "Movie title must be a string",
            required_error: "Movie title is required." 
        }
    )
})


function validateMovie (object) {
    return movieSchema.safeParse(object)                // ou .safeParseAsync no caso de ser com try catch
}


function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)      // .partial() faz com que todas as propriedades sejam optionais
}

module.exports = {
    validateMovie,
    validatePartialMovie
}