import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def post(url, body, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(f"{BASE_URL}{url}", data=json.dumps(body).encode(), headers=headers, method="POST")
    res = urllib.request.urlopen(req)
    return json.loads(res.read())

def get(url, token):
    headers = {"Authorization": f"Bearer {token}"}
    req = urllib.request.Request(f"{BASE_URL}{url}", headers=headers, method="GET")
    res = urllib.request.urlopen(req)
    return json.loads(res.read())

def put(url, token):
    headers = {"Authorization": f"Bearer {token}"}
    req = urllib.request.Request(f"{BASE_URL}{url}", headers=headers, method="PUT")
    res = urllib.request.urlopen(req)
    return json.loads(res.read())

# 1. Login as Admin
admin_login = post("/api/auth/login", {"username": "rakesh.kore", "password": "Password@123"})
admin_token = admin_login["access_token"]
print("Admin login success. User role:", admin_login["user"]["role"])

# Mark all as read first to get clean baseline
put("/api/notifications/read-all", admin_token)

notifs_before = get("/api/notifications", admin_token)
unread_before = [n for n in notifs_before if not n.get("read")]
print(f"Admin notifications count before ticket: Total={len(notifs_before)}, Unread={len(unread_before)}")

# 2. Login as Employee
emp_login = post("/api/auth/login", {"username": "aashish.d", "password": "Password@123"})
emp_token = emp_login["access_token"]
emp_id = emp_login["user"]["id"]
print(f"Employee login success. ID: {emp_id}, Name: {emp_login['user']['name']}")

# 3. Employee raises ticket
ticket_payload = {
    "asset_id": "QITS0267",
    "reported_by": emp_id,
    "issue": "Test Bell Icon Notification Issue",
    "description": "Testing if notification badge appears for admin",
    "priority": "High",
    "assigned_to": "IT Support Team",
    "estimated_completion": "In 3 days"
}
new_ticket = post("/api/repairs", ticket_payload, emp_token)
print(f"Created ticket: {new_ticket['id']}")

# 4. Check Admin notifications now!
notifs_after = get("/api/notifications", admin_token)
unread_after = [n for n in notifs_after if not n.get("read")]
print(f"Admin notifications count AFTER ticket: Total={len(notifs_after)}, Unread={len(unread_after)}")
print("Latest 3 notifications for Admin:")
for n in notifs_after[:3]:
    print(" ", n["id"], "|", n["title"], "| read:", n["read"], "| emp_id:", n.get("employeeId"))
