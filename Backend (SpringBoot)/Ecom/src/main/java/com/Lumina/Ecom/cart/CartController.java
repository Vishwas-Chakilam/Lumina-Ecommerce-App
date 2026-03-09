package com.Lumina.Ecom.cart;

import com.Lumina.Ecom.order.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemRepository cartItemRepository;
    private final CartService cartService;

    public CartController(CartItemRepository cartItemRepository, CartService cartService) {
        this.cartItemRepository = cartItemRepository;
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<List<CartItem>> getCart(@RequestParam("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        return ResponseEntity.ok(cartItemRepository.findByUserId(uid));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCartCount(@RequestParam("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        int count = cartItemRepository.findByUserId(uid)
                .stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
        return ResponseEntity.ok(count);
    }

    @PostMapping("/add")
    public ResponseEntity<Void> addToCart(
            @RequestParam("userId") String userId,
            @RequestParam("productId") String productId,
            @RequestParam("quantity") int quantity
    ) {
        UUID uid = UUID.fromString(userId);
        if (quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }

        CartItem existing = cartItemRepository.findByUserIdAndProductId(uid, productId).orElse(null);
        if (existing == null) {
            CartItem item = CartItem.builder()
                    .userId(uid)
                    .productId(productId)
                    .quantity(quantity)
                    .createdAt(java.time.OffsetDateTime.now())
                    .build();
            cartItemRepository.save(item);
        } else {
            existing.setQuantity(existing.getQuantity() + quantity);
            cartItemRepository.save(existing);
        }

        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{itemId}/quantity")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable("itemId") String itemId,
            @RequestParam("userId") String userId,
            @RequestParam("quantity") int quantity
    ) {
        UUID uid = UUID.fromString(userId);
        UUID cartId = UUID.fromString(itemId);

        if (quantity <= 0) {
            return ResponseEntity.badRequest().build();
        }

        return cartItemRepository.findById(cartId)
                .filter(item -> item.getUserId().equals(uid))
                .map(item -> {
                    item.setQuantity(quantity);
                    cartItemRepository.save(item);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable("itemId") String itemId,
            @RequestParam("userId") String userId
    ) {
        UUID uid = UUID.fromString(userId);
        UUID cartId = UUID.fromString(itemId);

        return cartItemRepository.findById(cartId)
                .filter(item -> item.getUserId().equals(uid))
                .map(item -> {
                    cartItemRepository.delete(item);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestParam("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        cartItemRepository.deleteByUserId(uid);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> createOrderFromCart(@RequestParam("userId") String userId) {
        UUID uid = UUID.fromString(userId);
        Order order = cartService.createOrderFromCart(uid);
        return ResponseEntity.ok(order);
    }
}

