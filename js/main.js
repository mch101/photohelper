//Get elements from DOM
var pageheader = $("#page-header")[0];
var pagecontainer = $("#page-container")[0];
var colorcontainer = $('#color-text')[0];
var imgSelector = $("#my-file-selector")[0];
var thumbnailbtn = $("#thumbnailbtn")[0];
//Create a class to hold the colour response from our API
var MainColour = (function () {
    function MainColour(gen_color1, gen_color2, gen_color3) {
        this.gen_color1 = gen_color1;
        this.gen_color2 = gen_color2;
        this.gen_color3 = gen_color3;
        this.colour1 = gen_color1;
        this.colour2 = gen_color2;
        this.colour3 = gen_color3;
    }
    return MainColour;
}());
//When a file has been entered into the input element, process it using the helper function processImage
//and display if valid
imgSelector.addEventListener("change", function () {
    processImage(function (file) {
        var img = $("#selected-img")[0];
        img.src = URL.createObjectURL(file);
        img.style.display = "block";
        thumbnailbtn.style.display = "inline";
        colorcontainer.innerHTML = "";
    });
});
//Helper function to check if the input file is a valid image file
function processImage(callback) {
    var file = imgSelector.files[0];
    var filesize = Number(((file.size / 1024) / 1024).toFixed(4)); //in MB
    if (filesize > 4) {
        alert("File size is too big");
    }
    else {
        var reader = new FileReader();
        if (file) {
            reader.readAsDataURL(file);
            reader.onloadend = function () {
                if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
                    alert("Invalid file type");
                }
                else {
                    callback(file);
                }
            };
        }
        else {
            alert("Invalid file");
        }
    }
}
//Event listener for our thumbnail request button, which calls upon two APIs
thumbnailbtn.addEventListener("click", function () {
    var file = imgSelector.files[0];
    colorcontainer.innerHTML = "Processing...";
    thumbnailbtn.style.display = "none";
    sendColorRequest(file);
    sendTagRequest(file);
});
//API call requesting color. If response received, display the dominant colors
function sendColorRequest(file) {
    $.ajax({
        async: false,
        url: "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Color",
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "0b2caefc556b47509a7d8ee70dd329c3");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.length != 0) {
            var mycolors = new MainColour(data.color.dominantColorBackground, data.color.dominantColorForeground, data.color.dominantColors);
            var newstring = mycolors.colour3.join(", ");
            colorcontainer.innerHTML = "The main colors of this image: " +
                "<br />" + "Foreground: " + mycolors.colour1 +
                "<br />" + "Background: " + mycolors.colour2 +
                "<br />" + "Dominant: " + newstring;
            colorcontainer.innerHTML += "<p />";
        }
        else {
            colorcontainer.innerHTML = "An error occurred, please try again?";
            thumbnailbtn.style.display = "block";
        }
    })
        .fail(function (error) {
        colorcontainer.innerHTML = "An error occurred, please try again?";
        thumbnailbtn.style.display = "block";
        console.log(error.getAllResponseHeaders());
    });
}
//Sends a tag request, displays if valid
function sendTagRequest(file) {
    $.ajax({
        url: "https://api.projectoxford.ai/vision/v1.0/tag",
        beforeSend: function (xhrObj) {
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "0b2caefc556b47509a7d8ee70dd329c3");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.length != 0) {
            var mycolors = data.tags;
            var arr = [];
            for (var _i = 0, mycolors_1 = mycolors; _i < mycolors_1.length; _i++) {
                var entry = mycolors_1[_i];
                arr.push(entry.name);
            }
            var newstring = arr.join(", ");
            if (newstring) {
                colorcontainer.innerHTML += "Tags for this photo: " + newstring;
            }
            else {
                colorcontainer.innerHTML += "Tags for this photo: None";
            }
        }
        else {
            colorcontainer.innerHTML = "An error occurred, please try again?";
            thumbnailbtn.style.display = "block";
        }
    })
        .fail(function (error) {
        colorcontainer.innerHTML = "An error occurred, please try again?";
        thumbnailbtn.style.display = "block";
        console.log(error.getAllResponseHeaders());
    });
}
