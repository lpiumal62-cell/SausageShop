window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Data is loading", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        // await loadUserData();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function signOut() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        const response = await fetch("api/users/logout", {
            method: "GET",
            credentials: "include"
        });
        if (response.ok) {

                Notiflix.Report.success(
                    'SausageShop',
                    "Logout successful",
                    'Okay',
                    () => {
                        window.location = "sign-in.html";
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


async function loadUserData() {
    try {

        const response = await fetch("/api/user-Profiles/profileLoading");

        if (response.ok) {
            if (response.redirected) {
                window.location.href = response.url;
                return;
            }
            const data = await response.json();

            document.getElementById("userWelcome").innerHTML = `Hello, ${data.user.firstName} ${data.user.lastName}`;

            // let replacedText = String(data.user.sinceAt).replace("-", " ");
            // let since = replacedText.split(" ");
            // document.getElementById("welcome").innerHTML = `Smart Trade Member Since ${since[1]} ${since[0]}`;
            // document.getElementById("firstName").value = data.user.firstName;
            // document.getElementById("lastName").value = data.user.lastName;
            // document.getElementById("lineOne").value = data.user.lineOne ? data.user.lineOne : "";
            // document.getElementById("lineTwo").value = data.user.lineTwo ? data.user.lineTwo : "";
            // document.getElementById("postalCode").value = data.user.postalCode ? data.user.postalCode : "";
            // document.getElementById("citySelect").value = data.user.cityId ? data.user.cityId : 0;
            // document.getElementById("mobile").value = data.user.mobile;
            // document.getElementById("currentPassword").value = data.user.password;
        } else {
            Notiflix.Notify.failure("Profile data loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}