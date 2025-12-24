window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Data is loading", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {

    } finally {
        Notiflix.Loading.remove();
    }
});

async function logOut(){
    // alert("ok");
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch("api/admin/logout", {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {

            Notiflix.Report.success(
                'SausageShop Admin Panel',
                "Logout successful",
                'Okay',
                () => {
                    window.location = "admin-login.html";
                }
            );
        } else {
            Notiflix.Notify.failure("Something went wrong. Logout failed!", {
                position: 'center-top'
            });
        }

    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    } finally {
        Notiflix.Loading.remove(1000);
    }
}