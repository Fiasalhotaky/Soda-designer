
/*
=-=-=-=-=-=-=-=-=-=-=-=-
Soda Designer
=-=-=-=-=-=-=-=-=-=-=-=-
Student ID:23327416
Comment (Required):

open_assets on line 134
start_server on line 44
parse users_input.color on line 60
parse users_input.flavor on line 79
blit() method on line 110
deliver can method on line 117
cache method on line 84

=-=-=-=-=-=-=-=-=-=-=-=-
*/

var Jimp = require('jimp');
const http = require("http");
const server = http.createServer();
const port = 3000;
const fs = require('fs');
const main = fs.createReadStream('html/form.html');
const url = require('url');
const asset = fs.createReadStream('assets/image-credits.txt');

Jimp.read('assets/flavor/orange.png', (err, image) => {
    if (err) {
        throw err;
    }
    image
        .resize(128, 128)   // resize
        .greyscale()        // set greyscale
        .color([
            {apply: "red", params: [0]},
            {apply: "green", params: [0]},
            {apply: "blue", params: [128]}  //applies blue coloring to greyscale img
        ])
        .write('blorange.png', () => console.log("File Saved!") );
});

const start_server = function(can, flavors){

    server.on("request", connection_handler);
    function connection_handler(req, res){
        console.log(`New Request for ${req.url} from ${req.socket.remoteAddress}`);
        
        if( req.url === '/'){
            res.writeHead(200, {'Content-Type' : 'text/html'});
            main.pipe(res);
        }else if(req.url.startsWith ('assets/image-credits.txt')){
            res.writeHead(200, {'Content-Type' : 'text/plain'});
            asset.pipe(res);
        }else if(req.url.startsWith('/design')){
            // /design?color=%230000ff&flavor=apple
           // 
            let users_input = url.parse(req.url, true).query;
                if(users_input.color ){
                    console.log(users_input.color);
                    let hex = users_input.color;
                    
                    const hexToRgb = function hexToRgb(hex) {
                        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                        return (
                            result
                            ? {r: parseInt(result[1], 16), 
                               g: parseInt(result[2], 16), 
                               b: parseInt(result[3], 16)}
                            : {r: 255, g: 255, b: 255}
                        );
                    };
    
                    let color = new hexToRgb(hex);
                    console.log(color);
                    

                   if(users_input.flavor){
                    const only_id = flavors.map(flavor => flavor.id);   //array with only id propertys
                    let i = only_id.indexOf(users_input.flavor);
                    let filename = `./tmp/${users_input.flavor}-${color.r}-${color.g}-${color.b}.png`;
                    cache(filename);
                    //cache such that if the image exists already we skip to deliver_can(filename, res)
                    function cache(filename){
                        fs.exists(filename, function(exists) {
                            console.log("Does " + filename + " exist? " + exists);
                            deliver_can(filename, res);
                        });
                    }
                   // console.log(filename);
                    if(i == -1){
                        res.writeHead(404, {"Content-Type" : "text/plain"});
                        res.write("404 Not found");
                        res.end();
                    }else{
                        create_can(can, color, flavors[i], filename, res);
                    }

                    
                    function create_can (can, color, flavor, filename, res) {
                        let new_can = can.body.resource.clone();
                        let colored_can = new_can.color([
                            {apply: "red", params: [color.r]},
                            {apply: "green", params: [color.g]},
                            {apply: "blue", params: [color.b]}
                        ]);

                    
                    //blit() method
                    let file = can.lid.resource.blit(colored_can, 0, 0)
                                colored_can.blit(can.label.resource, 40, 210)
                                .blit(flavor.resource, flavor.x, flavor.y)
                                .write(filename, () => deliver_can(filename, res));
                            };

                    const deliver_can = function(filename, res){
                        const design = fs.createReadStream(filename);
                        res.writeHead(200, {'Content-Type' : 'image/png'});
                        design.pipe(res);
                    }
                 
                
                   

                } 
                }
                
            }else {}
    }
    
}

const open_assets = function() {
    const can = {
        lid: {path: "assets/can/can-lid.png"},
        body: {path: "assets/can/can-body.png"}, 
        label: {path: "assets/can/can-label.png"}
    };
    
    const flavors = [
        {id: "apple", path: "assets/flavor/apple.png", x: 120, y: 265},
        {id: "banana", path: "assets/flavor/banana.png", x: 80, y: 285},
        {id: "cherry", path: "assets/flavor/cherry.png", x: 100, y: 250},
        {id: "coconut", path: "assets/flavor/coconut.png", x: 110, y: 270},
        {id: "crab", path: "assets/flavor/crab.png", x: 83, y: 305},
        {id: "grape", path: "assets/flavor/grape.png", x: 93, y: 268},
        {id: "mango", path: "assets/flavor/mango.png", x: 100, y: 295},
        {id: "orange", path: "assets/flavor/orange.png", x: 90, y: 265},
        {id: "watermelon", path: "assets/flavor/watermelon.png", x: 75, y: 280}
    ];

    let counter = 0;
    let counterLength = flavors.length +3;
    for(let property in can){  
        Jimp.read(`${can[property].path}`, (err, image) => {
            if (err) {
                throw err;
            }
            //add new property "resource" and contain Jimp image
            can[property].resource = image;
            //can[property].resource = image.bitmap.data;
            //console.log(can);
        });
        counter++;
    }
   
    for(let i in flavors){
        
        Jimp.read(`${flavors[i].path}`, (err, image) => {
            if (err) {
                throw err;
            }
            flavors[i].resource = image;
        });
        counter++

        if(counter == counterLength){
            start_server(can, flavors);
        }
    }
  
}

open_assets();

server.on("listening", listening_handler);
server.listen(port);
function listening_handler(){
	console.log(`Now Listening on testing Port ${port}`);
}
