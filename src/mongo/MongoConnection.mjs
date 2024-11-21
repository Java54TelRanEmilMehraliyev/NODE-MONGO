import { MongoClient } from "mongodb";

export default class MongoConnection {
    #db;
    #client;

    constructor(connectionString, dbName) {
        this.#client = new MongoClient(connectionString);
        this.#db = this.#client.db(dbName);
    }

    getCollection(collectionName) {
        return this.#db.collection(collectionName);
    }

    
}