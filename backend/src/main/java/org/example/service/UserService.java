package org.example.service;

import org.example.dto.request.ChangePasswordRequest;
import org.example.dto.request.UpdateProfileRequest;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
    }

    public User updateUserProfile(String id, UpdateProfileRequest request) {
        User user = getUserById(id);
        
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        if (request.getPhoneNumber() != null) {
            user.setPhoneNumber(request.getPhoneNumber());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        
        return userRepository.save(user);
    }

    public void changePassword(String id, ChangePasswordRequest request) {
        User user = getUserById(id);
        
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    public User updateUserRole(String id, User.Role role) {
        User user = getUserById(id);
        user.setRole(role);
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Người dùng không tồn tại");
        }
        userRepository.deleteById(id);
    }

    public Page<User> getFilteredUsers(String keyword, String role, String fromDate, String toDate, Pageable pageable) {
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Keyword search (fullName, email, phoneNumber)
        if (keyword != null && !keyword.trim().isEmpty()) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("fullName").regex(keyword, "i"),
                Criteria.where("email").regex(keyword, "i"),
                Criteria.where("phoneNumber").regex(keyword, "i")
            );
            criteriaList.add(keywordCriteria);
        }
        
        // Role filter
        if (role != null && !role.trim().isEmpty()) {
            User.Role userRole = User.Role.valueOf(role);
            criteriaList.add(Criteria.where("role").is(userRole));
        }
        
        // Date range filter
        if (fromDate != null && !fromDate.trim().isEmpty()) {
            LocalDate from = LocalDate.parse(fromDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("createdAt").gte(from));
        }
        
        if (toDate != null && !toDate.trim().isEmpty()) {
            LocalDate to = LocalDate.parse(toDate, DateTimeFormatter.ISO_LOCAL_DATE);
            criteriaList.add(Criteria.where("createdAt").lte(to));
        }
        
        // Build final query
        Query query = new Query();
        if (!criteriaList.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteriaList.toArray(new Criteria[0])));
        }
        
        // Add pagination and sorting
        query.with(pageable);
        
        // Execute query
        List<User> users = mongoTemplate.find(query, User.class);
        long total = mongoTemplate.count(query.skip(0).limit(0), User.class);
        
        return new PageImpl<>(users, pageable, total);
    }
}
