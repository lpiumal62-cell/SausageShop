import org.hibernate.Session;
import com.eagle.sausageshop.util.HibernateUtil;

public class Test {
    public static void main(String[] args) {
        Session session = HibernateUtil.getSessionFactory().openSession();
        System.out.println("Connected to DB successfully!");
        session.close();
    }
}
