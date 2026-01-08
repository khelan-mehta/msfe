import { StyleSheet } from "react-native";

export const colors = {
  primary: '#38BDF8',
  primaryLight: '#E0F2FE',
  textDark: '#0F172A',
  textLight: '#64748B',
  cardBg: '#F8FAFC',
  border: '#E2E8F0',
  disabled: '#CBD5E1',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
    marginVertical: 16,
  },

  summaryCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },

  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },

  summaryContent: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textDark,
  },

  company: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  metaText: {
    fontSize: 13,
    color: colors.textLight,
  },

  dot: {
    marginHorizontal: 6,
    color: colors.textLight,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  location: {
    fontSize: 13,
    color: colors.textLight,
    marginLeft: 4,
  },

  detailCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 12,
  },

  sectionText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 6,
    lineHeight: 20,
  },

  applyButton: {
    marginTop: 20,
    backgroundColor: colors.disabled,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  applyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  }
})