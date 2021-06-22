//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-daonho:Hung.2711@cluster0.l3vuo.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});
const itemSchema = {
  name:{
    type: String,
    required: true
  }
};
const Item = mongoose.model("item", itemSchema);

const eat = new Item ({
  name: "Eat Food"
});

const cook = new Item({
  name: "Cook Food"
});

const buy = new Item({
  name: "Buy Food"
});

const itemDefault = [buy, cook, eat];


const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("list", listSchema);

app.get("/", function(req, res) {

  const day = date.getDate();

  Item.find(function(err,items){
    if(items.length === 0){
      Item.insertMany(itemDefault,function(error){
      if(error) {
        console.log(error);
      }else {
        console.log("successful");
      }
      });
        res.redirect("/");
    }else {
      res.render("list", {listTitle: day, newListItems: items});    }
  });



});


app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;
  List.findOne({name: customListName}, function(err, result){
    if(!result) {
      const list = new List({
        name: customListName,
        items: itemDefault
      });
      list.save();
      res.redirect("/" + customListName);
    }else {
       res.render("list", {listTitle: customListName, newListItems: result.items });
    }
  });



});

app.post("/", function(req, res){

  var item = new Item({
    name: req.body.newItem
  });
  var listName = req.body.list;
  if(listName === date.getDate()){
    item.save();
  res.redirect("/");
  }else {
  List.findOne({name:listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+foundList.name);
  });
}


});
app.post("/delete", function(req, res){
  const itemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === date.getDate()){
    Item.findByIdAndRemove(itemId,function(err){
      if(!err) console.log("Successfully to deleted checked item");
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: itemId}}}, function(err){
      if(!err){
        if(!err) console.log("Successfully to deleted checked item");
        res.redirect("/"+listName);
      }
    })
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
