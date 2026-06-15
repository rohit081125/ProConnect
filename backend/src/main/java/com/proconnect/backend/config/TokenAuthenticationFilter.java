package com.proconnect.backend.config;

import java.io.IOException;
import java.util.Collections;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import com.proconnect.backend.service.TokenService;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private final TokenService tokenService;

    public TokenAuthenticationFilter(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        System.out.println("TokenAuthenticationFilter: Request URI: " + request.getRequestURI() + ", Method: " + request.getMethod() + ", Auth Header: " + (authHeader != null ? "Present" : "Null"));
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            boolean isValid = tokenService.validateToken(token);
            System.out.println("TokenAuthenticationFilter: Token is valid: " + isValid);
            if (isValid) {
                TokenService.TokenData tokenData = tokenService.parseToken(token);
                if (tokenData != null) {
                    System.out.println("TokenAuthenticationFilter: Token parsed. Email: " + tokenData.email + ", Role: " + tokenData.role);
                    SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + tokenData.role.toUpperCase());
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            tokenData.email,
                            null,
                            Collections.singletonList(authority)
                    );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("TokenAuthenticationFilter: Set security context authentication for " + tokenData.email + " with authority: " + authority.getAuthority());
                } else {
                    System.out.println("TokenAuthenticationFilter: Token parsing failed (returned null)");
                }
            }
        }
        
        try {
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            System.out.println("TokenAuthenticationFilter: Filter chain exception: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
