const Branch = require("../models/branchModel");
const { validationResult } = require("express-validator");
const { authenticate } = require("./../config/passport");
const {validateBranchData} = require('./../middlewares/branchValidation');

exports.branch_list = [
    authenticate,
    async (req,res)=>{
        try{
            const branches = await Branch.find({}).sort({name: 1}).exec();
            res.status(200).json(branches);
        }catch(error){
            console.log("Error"+error);
            res.status(500).json({ error: 'MongoDB server Error' });
        }
    }
]
exports.branch_detail=[
    authenticate,
    async (req,res)=>{
        try{
            const branch= await Branch.findById(req.params.branchId).exec();
            if(branch === null)
            res.status(400).json({"error":"branch "+req.params.branchId+" doesn't exist"});
            res.status(200).json(branch);
        }catch(error){
            console.log("Error"+error);
            res.status(500).json({ error: 'MongoDB server Error' });
        }
    }
]
exports.branch_create = [
    authenticate,
    validateBranchData,
    async(req,res)=>{
        if(req.user.role!='admin')
            return res.status(401).json({error:'unauthorized'})

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }
        
        const branch = new Branch({
                name: req.body.name,
                location: {
                  postal_code: req.body.location.postal_code,
                  city: req.body.location.city,
                  province: req.body.location.province,
                  street: req.body.location.street
              },
              vehicles: req.body.vehicles || []
        })
        try{
            await branch.save();
            res.status(201).json(branch);
        }catch(error){
            console.error('Error creating branch:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    }
]