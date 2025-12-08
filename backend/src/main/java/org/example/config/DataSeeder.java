package org.example.config;

import org.example.entity.Car;
import org.example.entity.Category;
import org.example.entity.User;
import org.example.repository.CarRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(CategoryRepository categoryRepository,
            CarRepository carRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Users
            // Seed Users
            String adminEmail = "email.for.ai.987654321@gmail.com";
            User admin = userRepository.findByEmail(adminEmail).orElse(null);

            if (admin == null) {
                admin = new User();
                admin.setFullName("Admin User");
                admin.setEmail(adminEmail);
                admin.setRole(User.Role.ADMIN);
                admin.setCreatedAt(LocalDateTime.now());
            }

            // Always reset password to ensure we can login
            admin.setPassword(passwordEncoder.encode("123456789"));
            userRepository.save(admin);

            if (userRepository.count() <= 1) { // Only seed other users if DB is mostly empty
                if (!userRepository.existsByEmail("user@example.com")) {
                    User user = new User();
                    user.setFullName("Normal User");
                    user.setEmail("user@example.com");
                    user.setPassword(passwordEncoder.encode("user123"));
                    user.setRole(User.Role.CUSTOMER);
                    user.setCreatedAt(LocalDateTime.now());
                    userRepository.save(user);
                }
            }

            // Seed Categories
            if (categoryRepository.count() == 0) {
                Category sedan = new Category();
                sedan.setName("Sedan");
                sedan.setDescription("Dòng xe sedan sang trọng");

                Category suv = new Category();
                suv.setName("SUV");
                suv.setDescription("Dòng xe SUV mạnh mẽ");

                Category coupe = new Category();
                coupe.setName("Coupe");
                coupe.setDescription("Dòng xe thể thao");

                categoryRepository.saveAll(Arrays.asList(sedan, suv, coupe));
            }

            // Seed Cars
            if (carRepository.count() == 0) {
                Category sedan = categoryRepository.findByName("Sedan").orElse(null);
                Category suv = categoryRepository.findByName("SUV").orElse(null);

                if (sedan != null) {
                    Car c200 = new Car();
                    c200.setName("Mercedes-Benz C 200 Avantgarde");
                    c200.setPrice(new BigDecimal("1599000000"));
                    c200.setManufactureYear(2024);
                    c200.setColor("Trắng");
                    c200.setEngine("1.5L Turbo");
                    c200.setTransmission("9G-TRONIC");
                    c200.setSeats(5);
                    c200.setDescription("Mẫu sedan hạng sang cỡ nhỏ bán chạy nhất.");
                    c200.setImage(
                            "https://www.mercedes-benz.com.vn/content/vietnam/vi/passengercars/models/saloon/c-class/saloon/_jcr_content/root/responsivegrid/simple_stage/simple_stage_item_1603806955.component.damq6.3385061619176.jpg/mercedes-benz-c-class-w206-exterior-front-view-3400x1440.jpg");
                    c200.setCategory(sedan);

                    Car e300 = new Car();
                    e300.setName("Mercedes-Benz E 300 AMG");
                    e300.setPrice(new BigDecimal("3209000000"));
                    e300.setManufactureYear(2024);
                    e300.setColor("Đen");
                    e300.setEngine("2.0L Turbo");
                    e300.setTransmission("9G-TRONIC");
                    e300.setSeats(5);
                    e300.setDescription("Biểu tượng của sự thành đạt.");
                    e300.setImage(
                            "https://www.mercedes-benz.com.vn/content/vietnam/vi/passengercars/models/saloon/e-class/saloon/_jcr_content/root/responsivegrid/simple_stage/simple_stage_item_1603806955.component.damq6.3385061619176.jpg/mercedes-benz-e-class-w213-exterior-front-view-3400x1440.jpg");
                    e300.setCategory(sedan);

                    carRepository.saveAll(Arrays.asList(c200, e300));
                }

                if (suv != null) {
                    Car glc300 = new Car();
                    glc300.setName("Mercedes-Benz GLC 300 4MATIC");
                    glc300.setPrice(new BigDecimal("2799000000"));
                    glc300.setManufactureYear(2024);
                    glc300.setColor("Xám");
                    glc300.setEngine("2.0L Turbo");
                    glc300.setTransmission("9G-TRONIC");
                    glc300.setSeats(5);
                    glc300.setDescription("Mẫu SUV hạng sang được ưa chuộng nhất.");
                    glc300.setImage(
                            "https://www.mercedes-benz.com.vn/content/vietnam/vi/passengercars/models/suv/glc/suv/_jcr_content/root/responsivegrid/simple_stage/simple_stage_item_1603806955.component.damq6.3385061619176.jpg/mercedes-benz-glc-x254-exterior-front-view-3400x1440.jpg");
                    glc300.setCategory(suv);

                    carRepository.save(glc300);
                }
            }
        };
    }
}
