(function () {
    "use strict";

    var backButton = document.getElementById("go-back");

    if (backButton) {
        backButton.addEventListener("click", function () {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.assign("/");
            }
        });
    }
}());
