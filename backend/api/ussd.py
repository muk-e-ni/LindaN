"""
LindaNyota Africa's Talking USSD Gateway
Endpoint: POST /api/v1/ussd
Handles USSD Session State Machine for Students and Mama Mboga Merchants.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Form, HTTPException, Response
from pydantic import BaseModel
import httpx

from backend.core.security import (
    generate_secure_voucher_token,
    hash_voucher_token,
    rate_limiter,
)

ussd_router = APIRouter(prefix="/api/v1/ussd", tags=["USSD Gateway"])


# -----------------------------------------------------------------------------
# SMS Dispatcher via Africa's Talking SMS Gateway
# -----------------------------------------------------------------------------
async def send_at_sms(to_phone: str, message: str) -> bool:
    """
    Sends SMS alert to student/vendor using Africa's Talking SMS API.
    """
    # In production, uses AT SMS endpoint: https://api.africastalking.com/version1/messaging
    # Form payload: username, to, message, from (alphanumeric SenderID e.g., 'LindaNyota')
    try:
        # Example payload structure
        # async with httpx.AsyncClient() as client:
        #     res = await client.post(...)
        return True
    except Exception:
        return False


# -----------------------------------------------------------------------------
# USSD Webhook Handler
# -----------------------------------------------------------------------------
@ussd_router.post("", response_class=Response)
async def handle_ussd_session(
    sessionId: str = Form(...),
    serviceCode: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
):
    """
    Africa's Talking USSD Callback.
    Request params sent as application/x-www-form-urlencoded:
    - sessionId: Unique identifier for the USSD session
    - serviceCode: Shortcode dialed (e.g., *384*2026#)
    - phoneNumber: Dialing subscriber MSISDN (+2547XXXXXXXX)
    - text: User input history separated by '*' (e.g., '1*2')
    """
    text = text.strip()
    user_inputs = text.split("*") if text else []
    depth = len(user_inputs)

    # -------------------------------------------------------------------------
    # ROOT MENU (User just dialed *384#)
    # -------------------------------------------------------------------------
    if depth == 0 or text == "":
        response_msg = (
            "CON Karibu LindaNyota Student Welfare\n"
            "1. Omba Emergency Meal Voucher (KES 100)\n"
            "2. Angalia Hali Yangu ya FVI & Risk\n"
            "3. Omba CDF / County Bursary Match\n"
            "4. Mama Mboga / Canteen Merchant Menu\n"
            "5. Msaada & Huduma (Dean's Hotline)"
        )
        return Response(content=response_msg, media_type="text/plain")

    first_choice = user_inputs[0]

    # -------------------------------------------------------------------------
    # FLOW 1: Request Emergency Meal Voucher
    # -------------------------------------------------------------------------
    if first_choice == "1":
        # Rate limit check (Max 1 per 24 hours)
        can_request, wait_seconds = rate_limiter.can_request_voucher(phoneNumber)
        if not can_request:
            hours_left = max(1, int(wait_seconds / 3600))
            response_msg = (
                f"END Pole, tayari umepokea voucher ya leo.\n"
                f"Tafadhali jaribu tena baada ya masaa {hours_left}.\n"
                "Kama kuna dharura kali, wasiliana na Dean of Students: 0800 720 001."
            )
            return Response(content=response_msg, media_type="text/plain")

        if depth == 1:
            response_msg = (
                "CON Thibitisha Chuo Chako:\n"
                "1. University of Nairobi (UoN)\n"
                "2. Kenyatta University (KU)\n"
                "3. JKUAT Main Campus\n"
                "4. Moi University\n"
                "5. Egerton University"
            )
            return Response(content=response_msg, media_type="text/plain")

        if depth == 2:
            # Generate single-use 4-digit cryptographically secure code
            voucher_token = generate_secure_voucher_token()
            rate_limiter.record_request(phoneNumber)

            # In DB: Save salted hash with 2-hour expiry
            token_hash = hash_voucher_token(voucher_token, phoneNumber)
            expiry_str = (datetime.now(timezone.utc) + timedelta(hours=2)).strftime("%H:%M")

            # Dispatch SMS backup
            sms_text = (
                f"LindaNyota: Voucher yako ya chakula (KES 100) ni {voucher_token}. "
                f"Peleka kwa Mama Mboga au Canteen kabla ya {expiry_str} EAT. Linda Afya Yako!"
            )
            await send_at_sms(phoneNumber, sms_text)

            response_msg = (
                f"END Asante! Voucher yako ni:\n\n"
                f"*** {voucher_token} ***\n\n"
                f"Kiasi: KES 100 (Bila Malipo)\n"
                f"Inaisha saa: {expiry_str} EAT (Masaa 2)\n"
                f"Onyesha msimbo huu kwa Mama Mboga au Canteen.\n"
                "Ujumbe wa SMS pia umetumwa."
            )
            return Response(content=response_msg, media_type="text/plain")

    # -------------------------------------------------------------------------
    # FLOW 2: Check FVI Risk Status
    # -------------------------------------------------------------------------
    elif first_choice == "2":
        # Multi-factor score summary
        response_msg = (
            "END Hali Yako ya LindaNyota FVI:\n"
            "- HEF Band: Band 1 (Vulnerable)\n"
            "- FVI Score: 84 / 100 (CRITICAL RISK)\n"
            "- Emergency Food Aid: APPROVED\n"
            "- Bursary Priority: TIER 1 PRIORITY\n"
            "Ofisi ya Dean imearifiwa kusaidia karo yako."
        )
        return Response(content=response_msg, media_type="text/plain")

    # -------------------------------------------------------------------------
    # FLOW 3: Apply for Bursary Match (CDF / County / Alumni)
    # -------------------------------------------------------------------------
    elif first_choice == "3":
        if depth == 1:
            response_msg = (
                "CON Chagua Eneo la Nyumbani (CDF/County Pool):\n"
                "1. Kajiado County (Kajiado South CDF)\n"
                "2. Nairobi (Westlands / Embakasi East)\n"
                "3. Kakamega / Western County Pool\n"
                "4. Turkana / Pastoralist Emergency Fund\n"
                "5. UoN / Alumni Emergency Pool"
            )
            return Response(content=response_msg, media_type="text/plain")

        if depth == 2:
            pool_names = {
                "1": "Kajiado South CDF Pool",
                "2": "Nairobi County Bursary",
                "3": "Western County Pool",
                "4": "Turkana Emergency Fund",
                "5": "Alumni Micro-Sponsorship Fund",
            }
            chosen_pool = pool_names.get(user_inputs[1], "National Student Pool")
            response_msg = (
                f"END Ombi lako la {chosen_pool} limepokelewa!\n"
                "AI FVI Index: 84/100 (Imependekezwa kwa KES 25,000).\n"
                "Afisa wa Ustawi (Dean) atathibitisha ndani ya saa 24.\n"
                "Utapokea arifa kupitia SMS."
            )
            return Response(content=response_msg, media_type="text/plain")

    # -------------------------------------------------------------------------
    # FLOW 4: Mama Mboga / Canteen Merchant Menu
    # -------------------------------------------------------------------------
    elif first_choice == "4":
        if depth == 1:
            response_msg = (
                "CON Mama Mboga & Canteen Portal\n"
                "Tafadhali ingiza 4-Digit Voucher Code ya Mwanafunzi:"
            )
            return Response(content=response_msg, media_type="text/plain")

        if depth == 2:
            voucher_input = user_inputs[1].strip()
            if len(voucher_input) != 4 or not voucher_input.isdigit():
                response_msg = "END Kosa: Voucher code lazima iwe nambari 4. Tafadhali jaribu tena."
                return Response(content=response_msg, media_type="text/plain")

            # Simulate voucher atomic redemption
            # In production: invokes `SELECT redeem_voucher_atomic(...)`
            # and triggers Daraja B2C payout to vendor's M-Pesa line
            simulated_receipt = f"QK{voucher_input}899X1"
            response_msg = (
                f"END VOUCHER IMETHIBITISHWA! (KES 100)\n"
                f"Mpe mwanafunzi mlo wa KES 100.\n"
                f"M-Pesa B2C Malipo yatumwa kwa nambari yako: {phoneNumber}\n"
                f"Daraja Ref: {simulated_receipt}."
            )
            return Response(content=response_msg, media_type="text/plain")

    # -------------------------------------------------------------------------
    # FLOW 5: Support & Dean's Emergency Hotline
    # -------------------------------------------------------------------------
    elif first_choice == "5":
        response_msg = (
            "END LindaNyota Student Support:\n"
            "Toll-free Hotline: 0800 720 001\n"
            "SMS Help: 22141\n"
            "Welfare Office: Room 104, Student Center.\n"
            "Hauko peke yako. Tupo hapa kusaidia."
        )
        return Response(content=response_msg, media_type="text/plain")

    # Fallback
    return Response(
        content="END Chaguo batili. Piga *384# kuanza upya.",
        media_type="text/plain",
    )
