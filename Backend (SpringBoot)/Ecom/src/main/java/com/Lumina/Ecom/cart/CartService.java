package com.Lumina.Ecom.cart;

import com.Lumina.Ecom.order.Order;
import com.Lumina.Ecom.order.OrderItem;
import com.Lumina.Ecom.order.OrderItemRepository;
import com.Lumina.Ecom.order.OrderRepository;
import com.Lumina.Ecom.order.OrderStatus;
import com.Lumina.Ecom.product.Product;
import com.Lumina.Ecom.product.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public CartService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional
    public Order createOrderFromCart(UUID userId) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalStateException("Cart is empty");
        }

        BigDecimal total = cartItems.stream()
                .map(item -> {
                    Product product = productRepository.findById(item.getProductId())
                            .orElseThrow(() -> new IllegalStateException("Product not found: " + item.getProductId()));
                    BigDecimal price = product.getPrice();
                    return price.multiply(BigDecimal.valueOf(item.getQuantity()));
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        String orderId = "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6);

        Order order = Order.builder()
                .id(orderId)
                .userId(userId)
                .total(total)
                .status(OrderStatus.pending)
                .createdAt(OffsetDateTime.now())
                .build();
        orderRepository.save(order);

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new IllegalStateException("Product not found: " + cartItem.getProductId()));

            BigDecimal price = product.getPrice();

            OrderItem orderItem = OrderItem.builder()
                    .orderId(orderId)
                    .productId(product.getId())
                    .quantity(cartItem.getQuantity())
                    .price(price)
                    .createdAt(OffsetDateTime.now())
                    .build();
            orderItemRepository.save(orderItem);

            int nextStock = Math.max(0, product.getStock() - cartItem.getQuantity());
            product.setStock(nextStock);
            productRepository.save(product);
        }

        cartItemRepository.deleteByUserId(userId);

        return order;
    }
}

