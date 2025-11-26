// Copy this Card component and paste it in src/app/admintrip/travels/edit/[id]/page.tsx
// Location: Before the Submit button, after the last Card (Contact Info or Additional Info)

{/* Password Reset Section */}
<Card className="p-6 border-2 border-orange-200 bg-orange-50">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    </div>
    <div>
      <h3 className="text-lg font-bold text-orange-900">Reset Password Login</h3>
      <p className="text-sm text-orange-700">Reset password untuk Travel Admin</p>
    </div>
  </div>
  
  {!showPasswordReset ? (
    <div>
      <p className="text-sm text-orange-800 mb-4">
        Gunakan fitur ini jika Travel Admin lupa password atau perlu reset password.
      </p>
      <Button
        type="button"
        variant="outline"
        className="border-orange-300 text-orange-700 hover:bg-orange-100"
        onClick={() => setShowPasswordReset(true)}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        Reset Password
      </Button>
    </div>
  ) : (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-orange-900 mb-2 block">
          Password Baru *
        </label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Minimal 6 karakter"
          minLength={6}
          className="border-orange-300 focus:border-orange-500"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium text-orange-900 mb-2 block">
          Konfirmasi Password Baru *
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Ketik ulang password baru"
          className="border-orange-300 focus:border-orange-500"
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleResetPassword}
          disabled={resettingPassword}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {resettingPassword ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Mereset...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Reset Password
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowPasswordReset(false)
            setNewPassword('')
            setConfirmPassword('')
          }}
          disabled={resettingPassword}
          className="border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          Batal
        </Button>
      </div>
      
      <div className="p-3 bg-orange-100 border border-orange-300 rounded-lg">
        <p className="text-xs text-orange-800">
          <strong>⚠️ Perhatian:</strong> Setelah reset, informasikan password baru kepada Travel Admin. 
          Password lama tidak akan bisa digunakan lagi.
        </p>
      </div>
    </div>
  )}
</Card>
