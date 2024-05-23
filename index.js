import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import multer from "multer"
import helmet from "helmet"
import morgan from "morgan"
import path from "path"
import { fileURLToPath } from "url"
import { adminRegister } from "./controllers/admin_auth.js"
import { customerRegister } from "./controllers/customer_auth.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import { update_info } from "./controllers/user.js"
import { verifyToken } from "./middleware/auth.js"
import adminRouter from "./routes/admin.js"
import { addOffer, addShop } from "./controllers/admin.js"

/*  CONFIGURATIONS  */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();



app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy:"cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json({limit:"30mb",extended:true}));
app.use(bodyParser.urlencoded({limit:"30mb",extended:true}));
app.use(cors());  
app.use("/assets",express.static(path.join(__dirname,'public/assets')));

/*  FILE STORAGE  */
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"public/assets");
    },
    filename:function(req,file,cb){
        cb(null,file.originalname);
    }
});

const upload = multer({storage});

const uploadFile = (req, res) => {
    const {file} = res.body;
    const file_path = `public/assets/${file}`;
    res.sendFile(path.resolve(__dirname, file_path));
};

/* ROUTES WITH FILES */
app.get("/assets",uploadFile);
app.post("/auth/admin_register", upload.single("picture"), adminRegister);
app.post("/auth/customer_register", upload.single("picture"), customerRegister);
app.post("/user/update_info", verifyToken , upload.single("picture") , update_info );
app.post("/admin/add_shop",verifyToken,upload.array("photos"),addShop);
app.post("/admin/add_offer",verifyToken,upload.array("photos"),addOffer);


/* ROUTES */
app.use("/auth",authRoutes);
app.use("/user",userRoutes);
app.use("/admin",adminRouter);


/* SERVER SETUP */
const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Server Port : ${PORT}`));



