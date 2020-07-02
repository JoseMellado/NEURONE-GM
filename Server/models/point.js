const mongoose = require('mongoose');
const { Schema } = mongoose;

const PointSchema = new Schema({
    app_name: { type: String, required: true},
    name: { type: String, required: true},
    abbreviation: { type: String, required: true},
    initialPoints: { type: Number, required: true},
    maxPoints: { type: Number, required: true},
    dailyMax: { type: Number, required: true},
    default: { type: Boolean, required: true},
    hidden: { type: Boolean, required: true},
});

module.exports = mongoose.model('Point', PointSchema);