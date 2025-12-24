import com.eagle.sausageshop.entity.Address;
import com.eagle.sausageshop.entity.User;
import com.eagle.sausageshop.mail.VerificationMail;
import com.eagle.sausageshop.provider.MailProvider;
import org.hibernate.Session;
import com.eagle.sausageshop.util.HibernateUtil;

import java.util.ArrayList;

public class Test {
    public static void main(String[] args) {


////User Name And Address Check
//        try (Session s = HibernateUtil.getSessionFactory().openSession()) {
//            User user = s.createQuery("FROM User u WHERE u.id=:id", User.class)
//                    .setParameter("id", 16)
//                    .uniqueResult();
//            Address primaryAddress = null;
//            for (Address address : user.getAddresses()) {
//                if (address.isPrimary()) {
//                    primaryAddress = address;
//                    break;
//                }
//            }
//            if (primaryAddress != null) {
//                System.out.println(primaryAddress.getLineOne());
//            }
//        }


////        Mail_Check
//        MailProvider.getInstance().start();
//        VerificationMail verificationMail = new VerificationMail("lakshithapiumal09@gmail.com", "123456");
//        MailProvider.getInstance().sendMail(verificationMail);
//
//
////
//      //  Hibernate_Check
//        Session session = HibernateUtil.getSessionFactory().openSession();
//        System.out.println("Connected to DB successfully!");
//        session.close();
    }
}
