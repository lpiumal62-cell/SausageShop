import com.eagle.sausageshop.mail.VerificationMail;
import com.eagle.sausageshop.provider.MailProvider;
import org.hibernate.Session;
import com.eagle.sausageshop.util.HibernateUtil;

public class Test {
    public static void main(String[] args) {


//        Mail_Check
        MailProvider.getInstance().start();
        VerificationMail verificationMail = new VerificationMail("lakshithapiumal09@gmail.com", "123456");
        MailProvider.getInstance().sendMail(verificationMail);



      //  Hibernate_Check
        Session session = HibernateUtil.getSessionFactory().openSession();
        System.out.println("Connected to DB successfully!");
        session.close();
    }
}
