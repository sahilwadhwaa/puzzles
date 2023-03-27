//import packages
import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import multer, { diskStorage } from "multer"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"
import { fileURLToPath } from "url"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/users.js"
import postRoutes from "./routes/posts.js"
import {register} from "./controllers/auth.js"
import {createPost} from "./controllers/posts.js"
import { verifyToken } from "./middleware/auth.js"
import User from "./models/User.js"
import Post from "./models/Post.js"
import {users, posts} from "./data/index.js"

//CONFIGURATIONS

//Converting the file to properly encoded path
const __filename= fileURLToPath(import.meta.url);
const __dirname= path.dirname(__filename);
dotenv.config();
const app = express();
//express middlewares

app.use(express.json());

//helps in securing express applications
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: "cross-origin"}));

//Morgan is an HTTP request level Middleware. 
//tool that logs the requests along with some other information depending upon its configuration and the preset used.
app.use(morgan("common"));
app.use(bodyParser.json({limit: "30mb", extended: true}));
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, 'public/assets')));

/* File Storage */
//used multer for handling multipart/form-data, which is primarily used for uploading files.
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/assets");
    },
    filename: function(req, file, cb){
        cb(null, file.originalname);
    }
});
const upload = multer({storage});

/*ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

//ROUTES
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* MONGOOSE SETUP*/
const PORT = process.env.PORT || 6001;
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
    //manually injecting fake data only one time
    //User.insertMany(users);
    //Post.insertMany(posts);
})
.catch((error) => console.log(`${error} did not connect`));