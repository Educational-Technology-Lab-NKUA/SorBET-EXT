//document.getElementById('loadGame').addEventListener('change', readFile, false);
// todo load game, fill table
/*pdfMake.fonts = {
  NotoSans: {
      normal: 'http://etl.ppp.uoa.gr/sorbet/js-libraries/Noto_Sans/NotoSans-Regular.ttf'

  }
}*/

/* changed! this function modified to load examples */
function openOnlineExample(fname) {
    $("body").css("cursor", "wait");

    //addr = 'http://etl.ppp.uoa.gr/sorbet/';

    if(language==greek) fname+="Gr";
    fpath = 'examples/' + fname + '.js'

    //try loading json, online/localhost only
    $.getJSON(fpath+"on", function(data) {
        //json loaded success
        SorterGame.loadGameFile(data);
        if (autostart) SorterGame.start();
    }).done(function() {

    })
    .fail(function(jqXHR, textStatus, errorThrown) {
    //getJSON request failed, let's load through script

        var script = document.createElement('script');
        script.onload = function() {
            //load the game through script
            SorterGame.loadGameFile(gamejson);
            if (autostart) SorterGame.start(); //added this line to start the game
        };
        script.src = fpath;
        document.head.appendChild(script);

    })
    .always(function() {  });;

    $("body").css("cursor", "default");
}

function readFile(event) {
  var file = event.target.files[0];
  if (!file) {
      alert("Failed to load file");
  } else {
      var r = new FileReader();
      r.onload = function(e) {
          var contents = e.target.result;
          try {
              var loadedJSON = (JSON.parse(contents))
              console.log(loadedJSON);
              SorterGame.loadGameFile(loadedJSON);
          } catch (e) {
              //oldFilesRead (contents)
          }


      }
      r.readAsText(file);
  }
}

function downloadScore() {

  var playAnswers = SorterGame.getPlayAnswers();

  var scoreModal = document.getElementById("score-modal");
  var categories = [];
  var answers = [];
  for (var i = 0; i < SorterGame.categories.length; i++) {
      categories.push(SorterGame.categories[i].text)
  }
  categories.push(language.classUncl)

  /*
  for (var i = 0; i < playAnswers.length; i++) {
      var answer = [];
      for (var j = 0; j < playAnswers[i].answers.length; j++) {
          if (playAnswers[i].answers[j].type == "text") {
              answer.push( playAnswers[i].answers[j].text);
          } else if (playAnswers[i].answers[j].type == "img") {
            answer.push({image:playAnswers[i].answers[j].uri,
                        width:90, height:90});
          }
      }
      answers.push(answer)
  }
  */
// debugger;
  
//changed here to accomodate gameStats event



  var dd = {
      content: [
          {
              text: scoreModal.innerText,
              style: 'subheader'
          },
          {
            text:language.classtable,
              style: 'subheader'
          },
          {
              style: 'tableExample',
              table: {
                  body:

                      playAnswers
                      //document.getElementById("playAnswersTable").tBodies[0]

              }
          },

      ],
      styles: {
          header: {
              fontSize: 18,
              //	bold: true,
              margin: [0, 0, 0, 10]
          },
          subheader: {
              fontSize: 16,
              //bold: true,
              margin: [0, 10, 0, 5]
          },
          tableExample: {
              margin: [0, 5, 0, 15]
          },
          tableHeader: {
              //	bold: true,
              fontSize: 13,
              color: 'black'
          }
      },
      defaultStyle: {
          //font: 'NotoSans'
      }

  }
  console.log(playAnswers);

  //console.log(dd);
  pdfMake.createPdf(dd).download();
}

SorterGame.prototype.loadGameFile = function(contents, source) {
  if (source == 2) {
		//extendt2 platform
		this.gameObjects = JSON.parse(contents.gameObjects);
		this.categories = JSON.parse(contents.categories);
		fromLaunch = true;
	} else {
		this.gameObjects = contents.gameObjects;
		this.categories = contents.categories;
	}

  /*this.gameObjects = contents.gameObjects;
  this.categories = contents.categories;*/

  //game instructions
  if (contents.instructions!=undefined)
    this.instructions = contents.instructions

  if( contents.blockly!=undefined)
    Blockly.serialization.workspaces.load(contents.blockly.jsonGS, workspaceGamestart);
  if( contents.blockly!=undefined)
   Blockly.serialization.workspaces.load(contents.blockly.jsonGP,  workspaceGameplay);
  
  //blockly events, hermolaou intervention
    
    this.blocklyChangeGSEvent = function () {
        if (!fromLaunch) {
            var time = moment.utc().format("x");
            this.counters.blocklyChangeGameStartCounter++;
            var curstate = { value: "gamestart", event_count: this.counters.blocklyChangeGameStartCounter };
            var feedbackMsg = {
                type: "database",
                event: "blockly_change_gamestart",
                id: this.gameID,
                state: curstate,
            };

            sendEvent(feedbackMsg);
        }
    };

    this.blocklyChangeGPEvent = function () {
        if (!fromLaunch) {
            var time = moment.utc().format("x");
            this.counters.blocklyChangeGameplayCounter++;
            var curstate = { value: "gameplay", event_count: this.counters.blocklyChangeGameplayCounter };
            var feedbackMsg = {
                type: "database",
                event: "blockly_change_gameplay",
                id: this.gameID,
                state: curstate,
            };

            sendEvent(feedbackMsg);
        }
    };


    workspaceGamestart.addChangeListener( (event)=> this.blocklyChangeGSEvent(event))
    workspaceGameplay.addChangeListener( (event)=> this.blocklyChangeGPEvent(event))

      



    //old code
  this.loadData();
  this.saveGame();
  this.loadPlayMode();
  fromLaunch = false;
}

/*
SorterGame.prototype.loadGame = function () {
}
*/


/*
    This file is part of "ChoiCo" a web application for designing digital games, written by Marianthi Grizioti for the National and Kapodistrian University of Athens (Educational Technology Lab).
    Copyright (C) 2017-2018.
    ChoiCo is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    ChoiCo is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
*/
function loadXml (fileName) {
    return new Promise ((resolve,reject)=> {

      var jqxhr = $.get(fileName).done (function(result){
      var serializer = new DOMParser();//XMLSerializer();
      console.log (fileName + ' loaded successfully')
      var xml = serializer./*serializeToString*/parseFromString(result, "text/xml").firstChild;
      resolve (xml)
    })
    .fail (function(){console.log (fileName + ' failed to load'); reject('error')})
  });
  }

const fsLimitMbs = 1
function loadImgFile(evt) {

  //Retrieve the first (and only!) File from the FileList object
  var f = evt.target.files[0];
  var rowNumber = this.parentNode.parentNode.rowIndex;
  var thumb = this.nextElementSibling;
  if (!f) {
      alert("Failed to load file");
  } else {

        //edit: upload file size limit
      
        if(f.size > fsLimitMbs * 1024 * 1024) {
            evt.target.value = ''; // Reset the file input
            thumb.src = 0
            alert(`The image size must be less than 1024 KB. Please choose a smaller file.`);
            console.log("Image size exceeds the limit, alert triggered."); // Debugging log
           
             return;
         }
   

        var r = new FileReader();
        r.onload = function(e) {
            var uri = e.target.result;
            /*var id =   parseInt(SorterGame.dataTable.tBodies[0].rows[rowNumber].cells[0].innerHTML)
                var newImg = {id: id, imguri: uri}
                var img = myGame.images.find(x=>x.id === id)
                if (img!= undefined)  //image already uploaded for this
                    img.imguri = uri;
                    else
                SorterGame.images.push(newImg);*/
            thumb.src = uri
        }
        r.readAsDataURL(f);
  }
}
