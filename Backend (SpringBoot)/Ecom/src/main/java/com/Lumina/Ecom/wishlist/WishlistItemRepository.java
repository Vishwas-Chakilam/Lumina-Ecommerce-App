package com.Lumina.Ecom.wishlist;

import com.Lumina.Ecom.wishlist.WishlistItem.WishlistItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WishlistItemRepository extends JpaRepository<WishlistItem, WishlistItemId> {

    List<WishlistItem> findByIdUserId(UUID userId);

    boolean existsByIdUserIdAndIdProductId(UUID userId, String productId);

    void deleteByIdUserIdAndIdProductId(UUID userId, String productId);
}

