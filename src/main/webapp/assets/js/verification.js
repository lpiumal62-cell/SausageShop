let params = new URLSearchParams(window.location.search);

const verificationCode = document.getElementById("verificationCode");
verificationCode.value = params.get("verificationCode");
const userEmail = params.get("email");

async function verifyType() {

    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    const verifyObj = {
        email: userEmail,
        verificationCode: verificationCode.value
    };

    try {
        const response = await fetch("api/verify-accounts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(verifyObj)
        });

        if (response.ok) {
            if (response.headers.get("content-type")?.includes("application/json")) {
                const data = await response.json();
                console.log(data)
                if (data.status) {
                    Notiflix.Report.success(
                        'SausageShop',
                        data.message,
                        'Okay',
                        () => window.location = "sign-in.html"
                    );
                } else {
                    Notiflix.Notify.failure(data.message);
                }

            } else {
                const text = await response.text();
                console.error(text);
                Notiflix.Notify.failure("Invalid server response");
            }

        } else {
            Notiflix.Notify.failure("Verification process failed!");
        }

    } catch (e) {
        Notiflix.Notify.failure(e.message || e.toString());
    } finally {
        Notiflix.Loading.remove(1000);
    }
}
