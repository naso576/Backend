
const mongoose = require('mongoose');
    
    const tabletSchema = mongoose.Schema(
        {
        
            tabletName : String,
            Composition : String,
          
        }, { timestamps: true }
      );

      tabletSchema.method("toJSON", function() {
        const { __v, _id, ...object } = this.toObject();
        object.id = _id;
        return object;
      });

      const tablets_list = mongoose.model("tablets_list", tabletSchema);
     
module.exports= tablets_list;
module.exports.tabletSchema=tabletSchema;