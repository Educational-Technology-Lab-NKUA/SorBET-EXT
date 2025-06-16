loadIntro = function() {
  $("#introArea").show();
  $("#gameScene").hide();
  $("#designArea").hide();
  $("#playButton").hide();
  $("#downloadButton").hide();
  $("#editButton").hide();

  $("#backgroundSpan").hide();

  if (SorterGame != undefined) {
      SorterGame.setDefaultData();
  }

}
SorterGame.prototype.loadDesignMode = function() {
  //analytics: Η επιλογή που κάνει ο παίκτης ανάμεσα στα modes (Design / Play / Edit)
  //this is design/edit
  this.switchModeEvent("design");
  const myState = this;

  $("#introArea").hide();
  $("#gameScene").hide();
  $("#designArea").show();
  $("#playButton").show();
  $("#downloadButton").show();
  $("#editButton").hide();

  //changed, have background checkbox appear and disappear too
  $("#backgroundSpan").hide();

  //todo: BAK: try removing this and see if the event still works
  $(".tableField").change((e) => {
      const textbox = e.target;
      const i = textbox.name;
      this.modifyCategoryEvent = {
          ...this.modifyCategoryEvent,
          state: {
              ...this.modifyCategoryEvent.state,
              info: {
                  entryscounter: i
              },
              name: {
                  old: "",
                  new: textbox.value
              },
          },
          timestamp: Date.now()

      };
      sendEvent(this.modifyCategoryEvent);
  });

  this.associateObjectEvent = function(objectId, categoryId, isAssociated) {
    if (!fromLaunch) {
      this.counters.associateObjectCounter++; // Increment counter
  
      const associationDetails = {
        objectId: objectId,
        categoryId: categoryId,
        isAssociated: isAssociated,  // True if associating, false if disassociating
      };
  
      const eventDetails = {
        id: this.gameID,
        type: "database", // Or another suitable category
        event: "associate_object",
        state: associationDetails, // Use associationDetails instead of state
        timestamp: Date.now()
      };
  
      sendEvent(eventDetails);
    }
  };


    // Checkbox Change Handler (Assuming 'this.dataTableHeader' is a DOM element)
    $("#tableContainer").on('change', ':checkbox', function() { 
        // Attaching to the *container* and delegating to checkboxes is efficient

        const objectId = $(this).data('object-id'); // Get the objectId from 
        // the checkbox's data attribute.  Assumes you've added this 
        // attribute to your checkboxes
        const categoryId = $(this).closest('tr').data('category-id'); 
        // Assumes category-id is stored on the table row
        const isChecked = $(this).is(':checked'); 
        // Determine if the checkbox is checked or unchecked

        if (objectId!==undefined && categoryId!==undefined)
            // Call the associateObject function with the necessary parameters
            this.associateObjectEvent(objectId, categoryId, isChecked);

    }.bind(this)); // Bind 'this' to the outer scope, so this.associateObject is accessible

};

SorterGame.prototype.addInstructions = function() {
  document.getElementById("designInstructions").style.display = "block";
}


SorterGame.prototype.clearContainers = function() {
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  ctx.clearRect(0, 0, this.width, this.height);
}



SorterGame.prototype.processCel = function(cel, gameObjects) {
  var typeElement = cel.querySelector(".type");
  var quantity = cel.querySelector(".how-many").value;
  if (quantity == "") {
      quantity = 1;

  }
  //var type = typeElement[selectedIndex].value;
  if (typeElement != null) {
      var type = typeElement.options[typeElement.selectedIndex].value;
      switch (type) {
          case "text":
              gameObjects.push({

                  right: [],
                  text: cel.querySelector(".text-type").value,
                  type: type,
                  num: quantity,
                  used: 0
              })
              //console.log("type",type);
              break;
          case "image":
              gameObjects.push({
                  right: [],
                  img: cel.querySelector(".image-thumb").src,
                  type: type,
                  num: quantity,
                  used: 0

              })
              break;
              // case "shape":
              //     gameObjects.push({
              //         right: [],
              //         selIndex: cel.querySelector(".shape-type").index,
              //         type: type,
              //         num: quantity,
              //         used: 0
              //
              //     })
              break;

      }
  }
}

SorterGame.prototype.processField = function(cel, categories) {
  var typeContainer = cel.querySelector(".tableField");
  if (typeContainer != null) {
      categories.push({

          text: typeContainer.value,
      })

  }
}


SorterGame.prototype.processCorrects = function(cel, gameObjects, right) {
  var checkboxElement = cel.querySelector(".correct");
  var checked = checkboxElement.checked;
  if (checked == true) {
      gameObjects[gameObjects.length - 1].right.push(right);
  }

}

SorterGame.prototype.createFile = function() {
  //analytics: 6)To αν κάνει download το παιχνίδι που δημιούργησε / τροποποίησε
  console.log("event: κάνει download το παιχνίδι ");

  this.saveGame();

  var fileName = prompt(language.messageSave, language.name);

  var jsonGS = Blockly.serialization.workspaces.save(workspaceGamestart);
  var jsonGP = Blockly.serialization.workspaces.save(workspaceGameplay);

  var JSONdata = {
      "gameObjects": this.dataTableRows,
      "categories": this.categories,
      "instructions": this.instructions,
      "blockly": {
          "jsonGS": jsonGS,
          "jsonGP": jsonGP
      }
  }; //now instructions too

  /*var textToWrite = "const gamejson="+JSON.stringify (JSONdata);
  const a = document.createElement("a");
  const file = new Blob([textToWrite], {type: 'text/javascript'});*/

  //εδ΄ώ καθορίζεται ο τύπος αρχείου που δημιουργείται όταν κάνει download
  var textToWrite = JSON.stringify(JSONdata);
  const a = document.createElement("a");
  const file = new Blob([textToWrite], {
      type: 'application/json'
  });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
}

SorterGame.prototype.clearDataTable = function() { //clears the dataTable from all rows and columns
  var dt = this.dataTable.tBodies[0];
  var headerTable = this.dataTableHeader;
  var tableRows = dt.rows.length;
  for (var i = tableRows - 1; i >= 0; i--) {
      dt.deleteRow(i)
  }
  var tableCells = headerTable.rows[0].cells.length;
  for (var i = tableCells - 1; i > 0; i--) {
      headerTable.rows[0].deleteCell(i)
      this.fields.splice(i, 1)
  }
}
SorterGame.prototype.setDefaultData = function() { //sets default data to the game (when going back to intro screen)
  // this.gameObjects =[];
  // this.categories = [{"text":"Field1"},{"text":"Field2"}]
  // this.fields = [{name: "ID"}, {name: "Field1"}, {name: "Field2"}];
  // this.score=0;
  // this.fieldsCounter=0;
  // this.idCounter=0;
  // this.loadData();
  this.gameObjects = [];
  this.categories = [{
          "text": language.field1
      },
      {
          "text": language.field2
      }
  ]
  this.fields = [{
      name: "ID"
  }, {
      name: "Field1"
  }, {
      name: "Field2"
  }];
  this.score = 0;
  this.fieldsCounter = 0;
  this.idCounter = 0;
  this.loadData();
}

SorterGame.prototype.loadData = function() {
  //loads the data to the dataTable
  this.clearDataTable();
  for (var i = 0; i < this.categories.length; i++) { //loads the header fields (categories)
      this.addField(this.categories[i].text)
  }
  for (var i = 0; i < this.gameObjects.length; i++) { //loads the rows data (game objects)
      this.newEntry(i, this.gameObjects[i])
  }

  // *** instructions ported from ChoiCo

  //this.instructions = playGameSettings.inst;
  if (this.instructions == undefined)
      this.instructions = language.gameInstructionsDefault;

  $("#instructionsEditor").jqteVal(this.instructions)

  this.fillGameInstructions(this.instructions);

  /* Fill from jqte editor:
  this.instructions = document.getElementsByClassName("jqte_editor")[0].innerHTML;
  if(this.instructions=="  ")
    this.instructions = gameInstructionsDefault
  this.fillGameInstructions(this.instructions );
  $("#gameInstructions").show();
  */

  //		$("#gameInstructions").hide();
};

SorterGame.prototype.sendAddCategoryEvent = function(entryscounter, name) {
  this.addCategoryEvent.state.info.entryscounter = entryscounter;
  this.addCategoryEvent.state.info.name = name;
  sendEvent(this.addCategoryEvent);
};

SorterGame.prototype.newTh = function(name) { //adds new th in the dataTableHeader
  var newField, th, checkbox, i;
  th = document.createElement('th');

  newField = document.createElement("input");
  newField.type = "text";
  newField.style.width = "78%";
  newField.style.height = "98%";
  newField.value = name;
  newField.className = "tableField";
  //newField.classList.add("container");

  // newField.onchange = function (){SorterGame.updateField(this)};
  th.appendChild(newField);
  checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.setAttribute('id', this.fieldsCounter - 1 + "_check");
  checkbox.onclick = function() {
      SorterGame.selectField(this);
  };
  th.appendChild(checkbox);
  /* var sortArrow =  document.createElement('input');
  sortArrow.type= "image";
  sortArrow.src = "media/imgs/sort_des.png";
  sortArrow.onclick = function () {sortCol(this)};
  sortArrow.title = "sort column";
  th.appendChild (sortArrow);
  var spanEl = document.createElement('span');
  var leftArrow =  document.createElement('input');
  leftArrow.type= "image";
  leftArrow.src = "media/imgs/left.png";
  leftArrow.onclick = function () {moveColumnLeft(leftArrow.closest("th"))};
  leftArrow.title = "move to the left";
  spanEl.appendChild (leftArrow);
  var rightArrow =  document.createElement('input');
  rightArrow.type= "image";
  rightArrow.src = "media/imgs/right.png";
  rightArrow.onclick = function () {moveColumnRight(rightArrow.closest("th"))}
  rightArrow.title = "move to the right";
  spanEl.appendChild (rightArrow);
  th.appendChild (spanEl);*/

  return (this.dataTableHeader.rows[0].appendChild(th));
}

SorterGame.prototype.addField = function(fieldName) {
  //var tr = table.tHead.children[0];
  var th;
  //  var   newName = "Field" + this.fields.length;
  th = this.newTh(fieldName);
  $(th).find("span").children("input").last().css("visibility", "hidden")
  var elem2 = th.previousElementSibling;
  $(elem2).find("span").children("input").last().css("visibility", "visible")

  if (!fromLaunch) this.insertNumberCol();

  this.fieldsCounter++;
  fieldrec = {
      name: fieldName
  };
  // fieldrec = {name: newName, type: "number", step: '.1'};
  this.fields.push(fieldrec);
  //this.newEntry(this.idCounter);

  this.sendAddCategoryEvent(this.fieldsCounter, fieldName);

  //to fix this:
      //
      /*The only way to get from the data what categories the user 
          puts in is from the modify category event. The logic says that
           as you put in categories, you use the first two that are already
            in the system and change the names. Here the system works
             normally and you get data. But when you put in new categories 
             and then go to set names the following event is not generated
              and we don't get any data. This needs to be fixed and is easy to fix.
      */

              
  $(".tableField").change((e) => {
    const textbox = e.target;
    const i = textbox.name;
    this.modifyCategoryEvent = {
        ...this.modifyCategoryEvent,
        state: {
            ...this.modifyCategoryEvent.state,
            info: {
                entryscounter: i
            },
            name: {
                old: "",
                new: textbox.value
            },
        },
        timestamp: Date.now()

    };
    sendEvent(this.modifyCategoryEvent);
  });
}

SorterGame.prototype.insertNumberCol = function() {
  for (var i = 0; i < this.idCounter; i++) {
      cel = this.dataTable.tBodies[0].rows[i].insertCell();
      console.log("counter col", this.idCounter);
      fieldBox1 = document.createElement("input");
      fieldBox1.type = "checkbox";
      fieldBox1.classList.add("correct");

      cel.appendChild(fieldBox1);

  }
  //console.log("entrys counter:", this.idCounter);

}

function replaceSpecialChars(textValue) {

  var special = /[!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]/g
  if (special.test(textValue)) {
      textValue = textValue.replace(special, "");
      alert('Parameter names cannot contain special characters (!@#$%^*,. etc). Any special character was removed from the name.')
  }
  textValue = textValue.replace(/ /g, "_"); //replace spaces
  return textValue;
}

/* SorterGame.prototype.updateField = function (f){
   var c = f.parentElement.cellIndex;
   var cleanName = replaceSpecialChars (f.value)
   if (checkDoubleName (cleanName)) {
       alert ('You cannot have two fields with the same name!')
       f.value = this.fields[c-1].name
   }
   else {
       f.value = cleanName;
       this.fields[c-1].name = f.value;}
}*/

SorterGame.prototype.selectField = function(cbx) {
  var boxes = $(':checkbox:checked', this.dataTableHeader);
  var i;
  for (i = 0; i < boxes.length; i++) {
      if (boxes[i] != cbx)
          boxes[i].checked = false;
  }
  if (cbx.checked) {
      field = cbx.parentElement;
      //field.className = "selectedField";
      this.checkId = cbx.id;
      $("#deleteFieldIcon").css('visibility', 'visible');
      //  $("#settingsIco").css('visibility','visible');
  } else {
      this.checkId = -1 //uncheck
      $("#deleteFieldIcon").css('visibility', 'hidden');
      //  $("#settingsIco").css('visibility','hidden');
  }
}

SorterGame.prototype.deleteField = function() {
  //analytics: διαγραφή μιάς κατηγορίας,

  var boxes = $(':checkbox:checked', this.dataTableHeader);
  if (boxes.lengh === 0) {
      alert(language.deletemsg)
  }
  var fieldNo = boxes[0].parentElement.cellIndex;

  //this.deleteCategoryEvent.state.info.entryscounter = fieldNo;
  //this.deleteCategoryEvent.state.info.name = $("input", boxes[0].parentElement).val();
  //sendEvent(this.deleteCategoryEvent, "Διαγραφή μιάς κατηγορίας");
  this.deleteCategoryEvent(      fieldNo, $("input", boxes[0].parentElement).val() );

  this.dataTableHeader.rows[0].deleteCell(fieldNo);
  for (var i = 0; i < this.idCounter; i++) {
      this.dataTable.tBodies[0].rows[i].deleteCell(fieldNo)

  }
  this.fieldsCounter--;
  this.fields.splice(fieldNo - 1, 1);
}

SorterGame.prototype.deleteElement = function() {
  var table = this.dataTable.tBodies[0];
  var tableRows = table.rows;
  var boxes = $(':checkbox:checked', this.dataTableHeader);
  var i;
  for (i = tableRows.length - 1; i >= 0; i--) {
      box = $(':checkbox:checked', tableRows[i].cells[0]);
      if (box.length > 0) {
          if (box[0].checked)
              table.deleteRow(i)
      }
  }
  this.idCounter--;


  this.deleteObjectEvent();

}



SorterGame.prototype.sendAddObjectEvent = function(idcounter, type, times) {
  this.addObjectEvent.state.info = {
      idcounter: idcounter,
      type: type,
      times: times
  };
  sendEvent(this.addObjectEvent);
};

SorterGame.prototype.newEntry = function(index, values) { //adds a new Entry (row) in position 'index' and sets each cell's value either to 'values' or to default if values are not passed. Index is a number values is an array of length the number of fields
  var row, cel, fieldbox1, selector, typeofelements, j, i, thumbnail, laodedData, br, sel, table, wrapper, checkox;
  if (values === undefined) {
      values = this.defaultValues;
  }
  try {
      if (index === undefined) {
          index = this.idCounter
      }
  } catch (err) {
      console.log(err)
  }
  table = this.dataTable.tBodies[0];
  row = table.insertRow(index); //insert a new Row
  for (j = 0; j < this.fields.length; j++) {
      cel = row.insertCell(j);
      if (j == 0) {
          switch (values.type) {
              case "image":
                  selector = this.createDropDown(0)
                  break;
              case "text":
                  selector = this.createDropDown(1)
                  break;
                  // case "shape":
                  // selector= this.createDropDown (2)
                  // break;
              default:
                  selector = this.createDropDown(1)
          }

          this.sendAddObjectEvent(this.idcounter, values.type, 1);

          wrapper = document.createElement("div");
          wrapper.classList.add("fields-wrapper");
          checkbox = document.createElement('input');
          checkbox.type = "checkbox";
          checkbox.style = "float:left;"
          //  checkbox.onclick=function(){SorterGame.selectRow(this);};
          cel.appendChild(checkbox);
          cel.appendChild(selector);
          cel.appendChild(wrapper);
          selector.onchange();

      } else {
          fieldBox1 = document.createElement("input");
          fieldBox1.type = "checkbox";
          fieldBox1.classList.add("correct");
          cel.appendChild(fieldBox1);
      }
  }
  this.setObjectValues(index, values)
  this.idCounter++;
  //console.log("fields in add field are:",this.fields);
  //  console.log("idcounter:",this.idCounter);
}

SorterGame.prototype.onChangeObject = function(e) {
  //when to do modify object? on any change
  // const listbox=this;
  if (!e) return;
  const td = $(e.target).closest("td")[0]; //.parentElement//.parentElement
  const i = td.rowIndex;
  // const newtype=this.value//listbox.options[listbox.selectedIndex].text;

  let obj = [];
  this.processCel(td, obj);

  this.modifyObjectEvent = {
      ...this.modifyObjectEvent,
      timestamp: time,
      state: {
          ...this.modifyObjectEvent.state,
          idcounter: i,
          object: obj[0]
      },
  };

  //   info: {idcounter: i,
  //     type: {old: '' , new: newtype /*, times: 2*/},
  //    times: $(listbox.parentElement).find(".how-many").val() },

  sendEvent(this.modifyObjectEvent);
};

SorterGame.prototype.createDropDown = function(id) {
  var selector = document.createElement("select");
  selector.type = "select";
  selector.id = "typeSelector"
  selector.classList.add("type");
  typeofelements = document.createElement("option");
  // typeofelements.value = "image";
  // typeofelements.text = "image";
  typeofelements.value = "image";
  typeofelements.text = language.image;
  selector.options.add(typeofelements, 1);
  typeofelements = document.createElement("option");
  typeofelements.value = "text";
  //typeofelements.text = "text";
  typeofelements.text = language.text;
  selector.options.add(typeofelements, 2);
  typeofelements = document.createElement("option");
  //typeofelements.value = "shape";
  //typeofelements.text = "shape";
  //typeofelements.text = language.shape;
  //selector.options.add(typeofelements, 3);
  const myState = this;
  //διαχείριση αλλαγής τύπου αντικειμένου
  //παραγωγή του συμβάντος modifyObjectEvent
  selector.onchange = function(e) {
      SorterGame.changeType(this.value, this.parentNode)
      myState.changeType(this.value, this.parentElement);
      myState.onChangeObject(e);
  };
  selector.selectedIndex = id;
  return selector;
}
SorterGame.prototype.setObjectValues = function(index, objectValues) { //sets the values of cell[index,0]
  var cell, element, quantity, checkbox;
  var table = this.dataTable.tBodies[0];
  var columns = table.rows[index].cells;
  var rightcategories = objectValues.right;
  if (objectValues === undefined) {
      var er = "no values to set";
      consloe.log(er);
      return 0;
  }
  cell = columns[0];
  switch (objectValues.type) {
      case "text":
          element = cell.getElementsByClassName("text-type")[0];
          element.value = objectValues.text;
          quantity = cell.getElementsByClassName("how-many")[0];
          quantity.value = parseInt(objectValues.num);
          break;
      case "image":
          element = cell.getElementsByClassName("image-thumb")[0];
          element.src = objectValues.img;
          quantity = cell.getElementsByClassName("how-many")[0];
          quantity.value = parseInt(objectValues.num);
          break;
          // case "shape":
          //   element = cell.getElementsByTagName("select")[1];
          //   element.selectedIndex = objectValues.selIndex;
          //   quantity = cell.getElementsByClassName("how-many")[0];
          //   quantity.value = parseInt(objectValues.num);
          //   break;
      default:
  }
  for (var i = 1; i < columns.length; i++) {
      checkbox = columns[i].getElementsByClassName("correct")[0];
      if (rightcategories.includes(i)) {
          checkbox.checked = true;
      } else {
          checkbox.checked = false;
      }
  }
}
SorterGame.prototype.changeType = function(newType, cel) { //cel
  var wrapper = cel.querySelector(".fields-wrapper");
  while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.lastChild);

  }
  const myState = this;
  switch (newType) {
      case "text":
          var t = document.createElement("input");
          t.type = "text";
          t.textContent = " to: ";
          t.classList.add("text-type");

          //για πιάσιμο του γεγονότος όταν αλλάζει κάτι στο αντικείμενο
          t.onchange = function(e) {
              myState.onChangeObject(e);
          }; //.onChangeObject;

          wrapper.appendChild(t);
          var to = document.createElement("input");
          to.type = "number"
          to.step = "1"
          to.min = "0";
          to.value = "1"
          to.classList.add("how-many");
          wrapper.appendChild(to)
          to.style.width = "33px"

          //για πιάσιμο του γεγονότος όταν αλλάζει κάτι στο αντικείμενο
          to.onchange = function(e) {
              myState.onChangeObject(e);
          }; //this.onChangeObject;

          break;

      case "image":
          var img = document.createElement("input");
          img.type = "file"
          img.addEventListener('change', loadImgFile, false)
          //img.style.width="50px" ;
          img.style.float = "right";
          var thumbnail = document.createElement("img");
          thumbnail.classList.add("image-thumb")
          thumbnail.src = "";
          thumbnail.style.width = "50px";
          thumbnail.style.height = "50px"
          img.classList.add("image-type");
          wrapper.appendChild(img);
          wrapper.appendChild(thumbnail);
          var to = document.createElement("input");
          to.type = "number"
          to.step = "1"
          to.min = "0";
          to.value = "1"
          to.classList.add("how-many");
          wrapper.appendChild(to)
          to.style.width = "33px"

          //για πιάσιμο του γεγονότος όταν αλλάζει κάτι στο αντικείμενο
          to.onchange = function(e) {
              myState.onChangeObject(e);
          }; //this.onChangeObject;




          break;
          // case "shape":
          //     var shSelect = document.createElement("select");
          //     shSelect.type = "select";
          //     var sh = document.createElement("option");
          //     sh.classList.add("shape-type");
          //     sh.value = "text";
          //     sh.text = language.circle;
          //     shSelect.options.add(sh, 1);
          //     sh = document.createElement("option");
          //     sh.value = "text";
          //     sh.text = language.rectangle;
          //     shSelect.options.add(sh, 2);
          //     wrapper.appendChild(shSelect);
          //     var to = document.createElement("input");
          //     to.type = "number"
          //     to.step = "1"
          //     to.min = "0";
          //     to.value="1"
          //     to.classList.add("how-many");
          //     wrapper.appendChild(to)
          //     to.style.width = "30px"
          //     break;
      default:
          var children = cel.childNodes;
          console.log("child:", cel.childNodes);
          if (children.length > 3) {
              cel.removeChild(children[4])
              cel.removeChild(children[3])
          }

  }

}

/*
SorterGame.prototype.deleteField = function() {

  var boxes = $(':checkbox:checked', this.dataTableHeader);
  if (!boxes.length) return

  var fieldNo = boxes[0].parentElement.cellIndex;
  if (this.fields[fieldNo - 1].type == "file") {
      this.images = [];
  }
  this.dataTableHeader.rows[0].deleteCell(fieldNo);
  for (i = 0; i < this.idCounter; i++) {
      this.dataTable.tBodies[0].rows[i].deleteCell(fieldNo)

  }
  this.fieldsCounter--;
  this.fields.splice(fieldNo - 1, 1);
}
  */