package org.example.repository;

import org.example.entity.Token;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface TokenRepository extends MongoRepository<Token, String> {

    @Query("{'userId': ?0, 'expired': false, 'revoked': false}")
    List<Token> findAllValidTokenByUser(String userId);

    Optional<Token> findByToken(String token);
}
