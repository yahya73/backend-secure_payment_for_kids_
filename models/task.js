import mongoose from "mongoose";

const { Schema, model } = mongoose;

const TaskSchema = new Schema({
    
    //child username
    childUsername:{
        type: String,
        required: true
    },
    //parent username
    parentUsername:{
        type: String,
        required: true
    },
    //task title
    title:{
        type: String,
        required: false
    },
    //task description
    description:{
        type: String,
        required: false
    },
    //amount of coins that will be transfered once the task is completed
    amount:{
        type: Number,
        required: false
    },
    //deadline 
    deadline:{
        type: Date,
        required: false
    },
    //task completed or not 
    status:{
        type: Boolean,
        required: false
    },
    //type picture or question or qcm or none(no validation needed)
    validationType:{
        type: String,
        required: false
    },
    // if the validationType = qcm
    qcmQuestion:{
        type: String,
        required: false
    },
    // if the validationType = qcm (example 1_2_[3]_4) the answer is in the []
    qcmOptions:{
        type: String,
        required: false
    },
    // if the validationType = question
    Answer:{
        type: String,
        required: false
    },
    score:{
        type: Boolean,
        required: false
    },
    imageAnswer:{
        type: String,
        required : false
    },


});

export default model('Task', TaskSchema);
