let params = new URLSearchParams(window.location.search);

const verificationCodeInput = document.getElementById("verificationCode");

// Set verification code from URL into input
verificationCodeInput.value = params.get("verificationCode");

const user = params.get("email");

async function verifyType() {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    const verifyObj = {
        email: user,
        verificationCode: verificationCodeInput.value
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
            const data = await response.json();
            console.log(data);

            if (data.status) {
                Notiflix.Report.success(
                    'SausageShop',
                    data.message,
                    'Okay',
                    () => {
                        window.location = "sign-in.html";
                    }
                );
            } else {
                Notiflix.Notify.failure(data.message);
            }
        } else {
            Notiflix.Notify.failure("Verification process failed!");
        }

    } catch (e) {
        Notiflix.Notify.failure(e.message || e);
    } finally {
        Notiflix.Loading.remove(1000);
    }
}
