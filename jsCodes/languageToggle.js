//load language setting from local storage
var language = localStorage.getItem('language') || "english";

//event handler
$(document).ready(function() {
    changeLanguage(language);
    $("#language").on(
        'click',
        function() {
            if ($("#language").attr('src') == "media/imgs/english.png") {
                changeLanguage("english");

            } else {

                changeLanguage("greek");
            }
        }
    );
});

function refreshLanguage() {
    $("#introText").text(language.introText);
    $("#introSubText").html(language.introSubText);

    $("#homeButton").html(language.homeButton);
    $("#examples").html(language.examples);
    $("#help").html(language.help);

    $("#information").html(language.information)
    $("#manual").html(language.manual)
    $("#publicationsDropdown").html(language.publicationsDropdown)
    $("#about").html(language.about)
    $("#manual").attr("href", language.manualUrl)
    $("#designG").html(language.designG)
    $("#loadG").html(language.loadG)
    //$("label[for='loadGame']").text(language.loadG)

    $("#play").html(language.play)
    $("#download").html(language.download)
    $("#objects_Name").html(language.objects_Name)
    $("#tableField").html(language.tableField)
    $("#edit").html(language.edit)
    $("#count").html(language.count)
    $("#start").html(language.start)
    $("#stop").html(language.stop)
    $("#close").html(language.close)
    $("#downloadScore").html(language.downloadScore)
    $("#gameOver").html(language.gameOver)
    $("#category").html(language.category)
    $("#classifObj").html(language.classifObj)
    $("#classUncl").html(language.classUncl)
    scoreModal = language.scoreModal;
    playAnswersTable = language.playAnswersTable;
    deleteIco = language.deleteIco;
    $("#addPoint").attr("title", language.addPoint)
    $("#deleteField").attr("title", language.deleteField)
    $("#addAttribute").html("title", language.addAttribute)
    $("#delCat").attr("title", language.delCat)


    $("#classesofAnimalsText").html(language.classesofAnimalsText)
    $("#seasonalDietText").html(language.seasonalDietText)
    $("#theNumbersText").html(language.theNumbersText)
    $("#fallingAnglesText").html(language.fallingAnglesText)
    $("#theAppGameText").html(language.theAppGameText)
    $("#biodegradableMaterialText").html(language.biodegradableMaterialText)
    $("#howLongForDegradationText").html(language.howLongForDegradationText)
    $("#multiCultiText").html(language.multiCultiText)
    $("#ancientGreekSyntaxText").html(language.ancientGreekSyntaxText)
    $("#ancientparentheticText").html(language.ancientparentheticText)
    $("#historyText").html(language.historyText)
    $("#latinText").html(language.latinText)
    $("#philoshophyText").html(language.philoshophyText)
    $("#ancientGreekNounsText").html(language.ancientGreekNounsText)
    $("#AncientGreekAnimalsText").html(language.AncientGreekAnimalsText)

    $("#messageSave").text(language.messageSave)
    $("#name").text(language.name)

    for (var name of ['show', 'classtable', 'field1', 'field2'])
        $("#" + name).html(language[name]);

    for (var name of ['image', 'text', 'shape'])
        $("option[value=" + name + "]").text(language[name]);

    // for (var name of ['circle','rectangle'])
    //   $("option[value="+name+"]").text(language[name]);



    //SorterGame.defaultValues.text=language.text

}

function changeLanguage(lang) {
    switch (lang){

      case "english":
        language = english;
        $("#language").attr("src", "media/imgs/greek.png")
          $("#multiCultiText").show();
        $("#ancientGreekNounsText").hide();
        $("#AncientGreekAnimalsText").hide();
        $("#ancientparentheticText").hide();
        $("#historyText").hide();
        $("#latinText").hide();
        $("#philoshophyText").hide();

        break;

      case "greek":
        language = greek;
        $("#language").attr("src", "media/imgs/english.png")
        $("#multiCultiText").hide();
        $("#ancientGreekNounsText").show();
        $("#AncientGreekAnimalsText").show();
        $("#ancientparentheticText").show();
        $("#historyText").show();
        $("#latinText").show();
        $("#philoshophyText").show();

        break;

    }

    localStorage.setItem('language', lang);
    //alert(lang);
    refreshLanguage();
}
