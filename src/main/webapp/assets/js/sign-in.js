async function signIn() {
    // alert("ok");
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });
    let email = document.getElementById("email");
    let password = document.getElementById("password")//.value;
    // alert(email+" "+password);
    const userLoginObj = {
        email: email.value,
        password: password.value
    }
    try{
        const response = await fetch("api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userLoginObj)
        });

        if (response.ok) {
            const data = await response.json();
            if(data.status){
                // Set user session in SausageApp if available
                if (window.SausageApp && data.user) {
                    window.SausageApp.setUserSession(data.user);
                }
                
                Notiflix.Report.success(
                    'SausageShop',
                    data.message,
                    'Okay', // button title
                    () => {
                        window.location = "index.html"
                    },
                );

            }else{
                Notiflix.Notify.failure(data.message,{
                    position:'center-top'
                });
            }
        } else {
            Notiflix.Notify.failure("Login failed! Please try again",{
                position:'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message,{
            position:'center-top'
        });
    }finally {
        Notiflix.Loading.remove(1000);
    }
}