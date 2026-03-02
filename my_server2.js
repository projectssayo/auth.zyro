import express from 'express';
import path from 'path';
import {fileURLToPath} from "url";

let app = express();

let PORT = process.env.PORT || 7444;

let __filename=fileURLToPath(import.meta.url);
let __dirname=path.dirname(__filename);

app.use(express.static(__dirname));
app.use(express.json())
app.set("view engine", "ejs");
app.set("views", __dirname);

function middleware(req, res, next) {
    console.log(`middleware called on ${req.url}`);
    next();
}

app.use(middleware);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '404.html'));
});


app.get("/u", async (req, res) => {
    let inp_token=req.query.token;
    console.log(`user provieded = ${inp_token}`);
    let my_url=`https://zyro-db.onrender.com/get_data_from_token?token=${inp_token}`
    let json_request=await fetch(my_url)

    let data = await json_request.json()

    console.log(data)

    if (data.success){
        console.log('yes data from url is success')
        res.render("input_page", {
            email: data.data.email,
            pfp: data.data.pfp,
            token:inp_token
        })

    }
    else{
        console.log('no data from url is unsuccessful')
        if (data.message.includes('already')){
            console.log('user has already used te url for resetting lock password ')
            res.sendFile(path.join(__dirname, 'already.html'));
            // res.send('user has already used te url for resetting lock password ')
        }
        else if (data.message.includes('expired')){
            console.log('user token has expired ask him to retry')
            res.sendFile(path.join(__dirname, 'expired.html'));
            // res.send('user has expired ask him to retry')
        }
        else{
            console.log('invalid token token dont exist')
            res.sendFile(path.join(__dirname, 'wrong_token.html'));
        }
    }



})



app.post("/reset-password", async (req, res) => {
    try {
        const { token, new_password } = req.body;

        let url = `https://zyro-db.onrender.com/update_password_via_token?token=${token}&password=${new_password}`;

        let json_req = await fetch(url);
        let jason_data = await json_req.json();

        console.log(jason_data);

        // Directly forward response from API
        res.json({
            success: jason_data.success,
            message: jason_data.message
        });

    } catch (err) {
        console.error(err);
        res.json({
            success: false,
            message: "Server error"
        });
    }
});



app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})