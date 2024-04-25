import gplay from "google-play-scraper";
import fs from "fs"

function saveJSON(filepath, data){
    fs.writeFile(filepath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('Data saved to data.json');
        }
    });
}

function readJson(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
}

function getFilenameType(collection){
    return (
        collection == gplay.collection.TOP_FREE ?
            "Free" :
        collection == gplay.collection.GROSSING ?
            "Grossing" :
        collection == gplay.collection.TOP_PAID ?
            "Paid" : null   
    )

}

async function getTop200(collection){
    const result = await gplay.list({
        category: gplay.category.GAME,
        collection: gplay.collection.TOP_PAID,
        num: 200
    })

    filename = getFilenameType(collection)
    if(!filename) throw Error("colleaction must be type of gplay.collection")

    saveJSON("./data/top"+ filename +"Games_200.json", result)
    return result
}


async function getCategoriesFromFile(collection){
    const filenameType = getFilenameType(collection)
    if(!filenameType) throw Error("colleaction must be type of gplay.collection")

    const sourceFilename = "./data/top" + filenameType + "Games_200.json"
    const outFilename = "./data/formatted" + filenameType + ".json"

    const source = await readJson(sourceFilename)
    
    var looper = 1;
    const promiseArr = source.map(game => {
        console.log(looper)
        looper++;
        return gplay.app({appId: game.appId})
    })

    const gamesData = await Promise.all(promiseArr)

    const result = gamesData.map(game => {
        console.log(looper--)
        return {
            title: game.title,
            description: game.description,
            score: game.score,
            categories: game.categories
        }
    })

    saveJSON(outFilename, result)
    return result
    
}

const result = getCategoriesFromFile(gplay.collection.GROSSING)
console.log(result)





